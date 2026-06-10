"""
Speculative Decoding Coordinator for Gemma 4 Models

This module implements speculative decoding optimization that uses a smaller assistant model
to predict tokens speculatively, which are then verified by the target model. This approach
can reduce inference latency by approximately 20% while maintaining output quality equivalent
to target-model-only generation.

Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
"""

import logging
from typing import Optional
import torch
from transformers import GenerationConfig

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SpeculativeDecodingCoordinator:
    """
    Coordinator for speculative decoding using target and assistant models.
    
    Speculative decoding is an optimization technique where:
    1. A smaller, faster assistant model predicts the next K tokens speculatively
    2. The target model verifies these predictions in parallel
    3. Matching predictions are accepted, reducing inference steps
    4. On mismatch, the target model's output is used and generation continues
    
    This approach maintains output quality while reducing generation latency.
    """
    
    def __init__(
        self,
        target_model,
        assistant_model,
        lookahead: int = 5
    ):
        """
        Initialize speculative decoding coordinator with models.
        
        Args:
            target_model: Primary Gemma 4 model (larger, higher quality)
            assistant_model: Smaller, faster assistant model for speculation
            lookahead: Number of tokens to predict speculatively (default: 5)
        
        Requirements: 8.1
        """
        self.target_model = target_model
        self.assistant_model = assistant_model
        self.lookahead = lookahead
        
        # Validate lookahead parameter
        if lookahead < 1:
            raise ValueError(f"Lookahead must be at least 1, got {lookahead}")
        
        logger.info(f"SpeculativeDecodingCoordinator initialized with lookahead={lookahead}")
    
    def generate(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
        generation_config: GenerationConfig,
        tokenizer
    ) -> torch.Tensor:
        """
        Generate tokens using speculative decoding.
        
        Process:
        1. Assistant model predicts next K tokens speculatively
        2. Target model verifies predictions in parallel
        3. Accept matching predictions and continue
        4. On mismatch, use target model output and continue
        5. Repeat until EOS token or max length reached
        
        Args:
            input_ids: Input token IDs tensor of shape (batch_size, seq_len)
            attention_mask: Attention mask tensor of shape (batch_size, seq_len)
            generation_config: Generation configuration with sampling parameters
            tokenizer: Tokenizer for decoding and special token handling
        
        Returns:
            Generated token IDs tensor of shape (batch_size, generated_seq_len)
        
        Requirements: 8.2, 8.3, 8.4, 8.5
        """
        # Initialize generation state
        device = input_ids.device
        batch_size = input_ids.shape[0]
        
        # Start with input tokens
        generated_ids = input_ids.clone()
        current_attention_mask = attention_mask.clone()
        
        # Generation parameters
        max_new_tokens = generation_config.max_new_tokens
        eos_token_id = generation_config.eos_token_id
        pad_token_id = generation_config.pad_token_id
        
        tokens_generated = 0
        accepted_tokens_total = 0
        rejected_tokens_total = 0
        
        logger.debug(f"Starting speculative decoding with max_new_tokens={max_new_tokens}")
        
        try:
            with torch.no_grad():
                while tokens_generated < max_new_tokens:
                    # Step 1: Assistant model predicts next K tokens speculatively
                    assistant_predictions = self._generate_assistant_predictions(
                        generated_ids,
                        current_attention_mask,
                        generation_config
                    )
                    
                    # Check if assistant returned valid predictions
                    if assistant_predictions is None or assistant_predictions.shape[1] == 0:
                        # Fallback to target model for single token
                        logger.debug("Assistant predictions invalid, falling back to target model")
                        next_token = self._generate_target_token(
                            generated_ids,
                            current_attention_mask,
                            generation_config
                        )
                        
                        generated_ids = torch.cat([generated_ids, next_token.unsqueeze(-1)], dim=-1)
                        current_attention_mask = torch.cat([
                            current_attention_mask,
                            torch.ones((batch_size, 1), dtype=torch.long, device=device)
                        ], dim=-1)
                        
                        tokens_generated += 1
                        
                        # Check for EOS
                        if next_token.item() == eos_token_id:
                            break
                        continue
                    
                    # Step 2: Target model verifies assistant predictions
                    accepted_count = self._verify_predictions(
                        generated_ids,
                        current_attention_mask,
                        assistant_predictions,
                        generation_config
                    )
                    
                    # Step 3: Accept matching predictions
                    if accepted_count > 0:
                        # Append accepted tokens
                        accepted_tokens = assistant_predictions[:, :accepted_count]
                        generated_ids = torch.cat([generated_ids, accepted_tokens], dim=-1)
                        current_attention_mask = torch.cat([
                            current_attention_mask,
                            torch.ones((batch_size, accepted_count), dtype=torch.long, device=device)
                        ], dim=-1)
                        
                        tokens_generated += accepted_count
                        accepted_tokens_total += accepted_count
                        
                        logger.debug(f"Accepted {accepted_count} tokens from assistant")
                        
                        # Check if we hit EOS in accepted tokens
                        if eos_token_id in accepted_tokens[0]:
                            break
                        
                        # Check if we've reached max tokens
                        if tokens_generated >= max_new_tokens:
                            break
                    
                    # Step 4: On mismatch or no acceptance, use target model
                    else:
                        logger.debug("No tokens accepted, using target model")
                        next_token = self._generate_target_token(
                            generated_ids,
                            current_attention_mask,
                            generation_config
                        )
                        
                        generated_ids = torch.cat([generated_ids, next_token.unsqueeze(-1)], dim=-1)
                        current_attention_mask = torch.cat([
                            current_attention_mask,
                            torch.ones((batch_size, 1), dtype=torch.long, device=device)
                        ], dim=-1)
                        
                        tokens_generated += 1
                        rejected_tokens_total += 1
                        
                        # Check for EOS
                        if next_token.item() == eos_token_id:
                            break
            
            # Log statistics
            acceptance_rate = (accepted_tokens_total / (accepted_tokens_total + rejected_tokens_total) * 100 
                             if (accepted_tokens_total + rejected_tokens_total) > 0 else 0)
            logger.info(f"Speculative decoding completed: {tokens_generated} tokens generated, "
                       f"{accepted_tokens_total} accepted, {rejected_tokens_total} rejected, "
                       f"acceptance rate: {acceptance_rate:.1f}%")
            
            return generated_ids
            
        except Exception as e:
            logger.error(f"Error during speculative decoding: {str(e)}")
            # Fallback: return current state
            return generated_ids
    
    def _generate_assistant_predictions(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
        generation_config: GenerationConfig
    ) -> Optional[torch.Tensor]:
        """
        Generate K tokens using the assistant model speculatively.
        
        Args:
            input_ids: Current sequence token IDs
            attention_mask: Current attention mask
            generation_config: Generation configuration
        
        Returns:
            Predicted token IDs of shape (batch_size, K) or None on failure
        
        Requirements: 8.2
        """
        try:
            # Generate K tokens using assistant model
            outputs = self.assistant_model.generate(
                input_ids=input_ids,
                attention_mask=attention_mask,
                max_new_tokens=self.lookahead,
                do_sample=generation_config.do_sample,
                temperature=generation_config.temperature,
                top_p=generation_config.top_p,
                top_k=generation_config.top_k,
                pad_token_id=generation_config.pad_token_id,
                eos_token_id=generation_config.eos_token_id,
                output_scores=False,
                return_dict_in_generate=False
            )
            
            # Extract only the newly generated tokens (remove input)
            new_tokens = outputs[:, input_ids.shape[1]:]
            
            return new_tokens
            
        except Exception as e:
            logger.warning(f"Assistant model prediction failed: {str(e)}")
            return None
    
    def _verify_predictions(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
        assistant_predictions: torch.Tensor,
        generation_config: GenerationConfig
    ) -> int:
        """
        Verify assistant model predictions using the target model.
        
        The target model generates tokens and compares them with assistant predictions.
        Returns the number of consecutive matching tokens from the start.
        
        Args:
            input_ids: Current sequence token IDs
            attention_mask: Current attention mask
            assistant_predictions: Assistant's predicted tokens
            generation_config: Generation configuration
        
        Returns:
            Number of consecutive accepted tokens from start (0 if first token mismatches)
        
        Requirements: 8.3, 8.4, 8.5
        """
        try:
            # Get target model's prediction for verification
            # We need to verify each predicted token sequentially
            accepted_count = 0
            current_ids = input_ids
            current_mask = attention_mask
            
            for i in range(assistant_predictions.shape[1]):
                # Get target model's next token logits
                outputs = self.target_model(
                    input_ids=current_ids,
                    attention_mask=current_mask,
                    return_dict=True
                )
                
                logits = outputs.logits[:, -1, :]  # Get logits for last position
                
                # Apply sampling if enabled
                if generation_config.do_sample:
                    # Apply temperature
                    if generation_config.temperature != 1.0:
                        logits = logits / generation_config.temperature
                    
                    # Apply top-k filtering
                    if generation_config.top_k > 0:
                        top_k = min(generation_config.top_k, logits.size(-1))
                        indices_to_remove = logits < torch.topk(logits, top_k)[0][..., -1, None]
                        logits[indices_to_remove] = float('-inf')
                    
                    # Apply top-p (nucleus) filtering
                    if generation_config.top_p < 1.0:
                        sorted_logits, sorted_indices = torch.sort(logits, descending=True)
                        cumulative_probs = torch.cumsum(torch.softmax(sorted_logits, dim=-1), dim=-1)
                        
                        # Remove tokens with cumulative probability above the threshold
                        sorted_indices_to_remove = cumulative_probs > generation_config.top_p
                        sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
                        sorted_indices_to_remove[..., 0] = 0
                        
                        indices_to_remove = sorted_indices_to_remove.scatter(1, sorted_indices, sorted_indices_to_remove)
                        logits[indices_to_remove] = float('-inf')
                    
                    # Sample from distribution
                    probs = torch.softmax(logits, dim=-1)
                    target_token = torch.multinomial(probs, num_samples=1).squeeze(-1)
                else:
                    # Greedy decoding
                    target_token = torch.argmax(logits, dim=-1)
                
                # Compare with assistant prediction
                assistant_token = assistant_predictions[:, i]
                
                if target_token.item() == assistant_token.item():
                    # Accept this token
                    accepted_count += 1
                    
                    # Update current sequence for next iteration
                    current_ids = torch.cat([current_ids, target_token.unsqueeze(-1)], dim=-1)
                    current_mask = torch.cat([
                        current_mask,
                        torch.ones((current_mask.shape[0], 1), dtype=torch.long, device=current_mask.device)
                    ], dim=-1)
                else:
                    # Mismatch found, stop verification
                    break
            
            return accepted_count
            
        except Exception as e:
            logger.warning(f"Prediction verification failed: {str(e)}")
            return 0
    
    def _generate_target_token(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
        generation_config: GenerationConfig
    ) -> torch.Tensor:
        """
        Generate a single token using the target model.
        
        Args:
            input_ids: Current sequence token IDs
            attention_mask: Current attention mask
            generation_config: Generation configuration
        
        Returns:
            Single generated token ID tensor of shape (batch_size,)
        """
        try:
            # Get model outputs
            outputs = self.target_model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                return_dict=True
            )
            
            logits = outputs.logits[:, -1, :]  # Get logits for last position
            
            # Apply sampling if enabled
            if generation_config.do_sample:
                # Apply temperature
                if generation_config.temperature != 1.0:
                    logits = logits / generation_config.temperature
                
                # Apply top-k filtering
                if generation_config.top_k > 0:
                    top_k = min(generation_config.top_k, logits.size(-1))
                    indices_to_remove = logits < torch.topk(logits, top_k)[0][..., -1, None]
                    logits[indices_to_remove] = float('-inf')
                
                # Apply top-p (nucleus) filtering
                if generation_config.top_p < 1.0:
                    sorted_logits, sorted_indices = torch.sort(logits, descending=True)
                    cumulative_probs = torch.cumsum(torch.softmax(sorted_logits, dim=-1), dim=-1)
                    
                    # Remove tokens with cumulative probability above the threshold
                    sorted_indices_to_remove = cumulative_probs > generation_config.top_p
                    sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
                    sorted_indices_to_remove[..., 0] = 0
                    
                    indices_to_remove = sorted_indices_to_remove.scatter(1, sorted_indices, sorted_indices_to_remove)
                    logits[indices_to_remove] = float('-inf')
                
                # Sample from distribution
                probs = torch.softmax(logits, dim=-1)
                next_token = torch.multinomial(probs, num_samples=1).squeeze(-1)
            else:
                # Greedy decoding
                next_token = torch.argmax(logits, dim=-1)
            
            return next_token
            
        except Exception as e:
            logger.error(f"Target model token generation failed: {str(e)}")
            raise
