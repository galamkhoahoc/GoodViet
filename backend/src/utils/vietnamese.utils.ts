/**
 * Vietnamese Text Normalization Utilities
 * 
 * Provides functions for normalizing Vietnamese text to ensure consistent
 * handling of diacritical marks and UTF-8 encoding.
 * 
 * Requirements: 9.6, 9.7
 */

/**
 * Normalize Vietnamese text using NFC (Canonical Composition)
 * 
 * This ensures Vietnamese diacritical marks are represented consistently
 * by combining base characters with combining marks into precomposed characters.
 * 
 * Example:
 * - Input: "tiếng" (with separate combining marks)
 * - Output: "tiếng" (with precomposed characters)
 * 
 * @param text - Text to normalize
 * @returns Normalized text in NFC form
 * 
 * Requirements: 9.6
 */
export function normalizeVietnamese(text: string): string {
  if (!text) return text;
  
  // Apply NFC normalization
  return text.normalize('NFC');
}

/**
 * Validate UTF-8 encoding of Vietnamese text
 * 
 * Checks if the text contains valid UTF-8 characters and no
 * invalid byte sequences.
 * 
 * @param text - Text to validate
 * @returns true if text is valid UTF-8, false otherwise
 * 
 * Requirements: 9.7
 */
export function isValidUTF8(text: string): boolean {
  if (!text) return true;
  
  try {
    // Try to encode and decode - invalid UTF-8 will throw
    const encoded = new TextEncoder().encode(text);
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(encoded);
    
    // Check if round-trip preserves text
    return decoded === text;
  } catch (error) {
    return false;
  }
}

/**
 * Normalize and validate Vietnamese text
 * 
 * Combines normalization and validation into a single function.
 * Throws an error if the text is not valid UTF-8.
 * 
 * @param text - Text to normalize and validate
 * @returns Normalized text
 * @throws Error if text is not valid UTF-8
 * 
 * Requirements: 9.6, 9.7
 */
export function normalizeAndValidate(text: string): string {
  if (!text) return text;
  
  // Validate UTF-8
  if (!isValidUTF8(text)) {
    throw new Error('Invalid UTF-8 encoding in Vietnamese text');
  }
  
  // Normalize
  return normalizeVietnamese(text);
}

/**
 * Normalize Vietnamese text in conversation history
 * 
 * Normalizes all content fields in a conversation history array.
 * 
 * @param history - Array of conversation messages
 * @returns History with normalized content
 * 
 * Requirements: 9.2, 9.6, 9.7
 */
export function normalizeHistory(
  history: Array<{ role: string; content: string }>
): Array<{ role: string; content: string }> {
  return history.map(msg => ({
    ...msg,
    content: normalizeVietnamese(msg.content)
  }));
}
