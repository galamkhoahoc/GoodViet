"""Export the GoodViet Vietnamese phoneme checkpoint for Transformers.js.

This script downloads the public PyTorch checkpoint, exports it to ONNX, creates
FP16 and dynamic-Q8 variants, writes the exact 123-label phoneme vocabulary, and
validates every generated graph with ONNX Runtime.

It intentionally contains no Hugging Face token and performs no upload.
"""

from __future__ import annotations

import argparse
import gc
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Sequence

import numpy as np
import onnx
import onnxruntime as ort
import torch
from huggingface_hub import hf_hub_download
from onnxconverter_common import float16
from onnxruntime.quantization import QuantType, quantize_dynamic
from transformers import AutoConfig, Wav2Vec2ForCTC


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


DEFAULT_MODEL_ID = (
    "tuanio/wav2vec2-base-finetune-vi_phone-non_freeze-spec_aug-500epoch"
)
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent / "dist" / "browser-model"
SAMPLE_RATE = 16_000
BLANK_TOKEN_ID = 0

# IMPORTANT: The ordering is the model's class-id mapping. Do not alphabetize it.
# Source: mdd/db/vi_phonemes.txt in the checkpoint author's repository.
PHONEMES: tuple[str, ...] = (
    "<pad>",
    "a-0",
    "a-1",
    "a-2",
    "a-3",
    "a-4",
    "a-5",
    "aː-0",
    "aː-1",
    "aː-2",
    "aː-3",
    "aː-4",
    "aː-5",
    "e-0",
    "e-1",
    "e-2",
    "e-3",
    "e-4",
    "e-5",
    "eaː-0",
    "eaː-1",
    "eaː-2",
    "eaː-3",
    "eaː-4",
    "eaː-5",
    "f",
    "h",
    "i-0",
    "i-1",
    "i-2",
    "i-3",
    "i-4",
    "i-5",
    "iz",
    "iə-0",
    "iə-1",
    "iə-2",
    "iə-3",
    "iə-4",
    "iə-5",
    "k",
    "kpz",
    "kz",
    "k̟z",
    "l",
    "m",
    "mz",
    "n",
    "nz",
    "o-0",
    "o-1",
    "o-2",
    "o-3",
    "o-4",
    "o-5",
    "p",
    "pz",
    "s",
    "t",
    "tz",
    "tʰ",
    "t͡ɕ",
    "u-0",
    "u-1",
    "u-2",
    "u-3",
    "u-4",
    "u-5",
    "uz",
    "uə-0",
    "uə-1",
    "uə-2",
    "uə-3",
    "uə-4",
    "uə-5",
    "v",
    "w",
    "x",
    "z",
    "ŋ",
    "ŋmz",
    "ŋz",
    "ŋ̟z",
    "ɓ",
    "ɔ-0",
    "ɔ-1",
    "ɔ-2",
    "ɔ-3",
    "ɔ-4",
    "ɔ-5",
    "ɗ",
    "ə-0",
    "ə-1",
    "ə-2",
    "ə-3",
    "ə-4",
    "ə-5",
    "əː-0",
    "əː-1",
    "əː-2",
    "əː-3",
    "əː-4",
    "əː-5",
    "ɛ-0",
    "ɛ-1",
    "ɛ-2",
    "ɛ-3",
    "ɛ-4",
    "ɛ-5",
    "ɣ",
    "ɨ-0",
    "ɨ-1",
    "ɨ-2",
    "ɨ-3",
    "ɨ-4",
    "ɨ-5",
    "ɨə-0",
    "ɨə-1",
    "ɨə-2",
    "ɨə-3",
    "ɨə-4",
    "ɨə-5",
    "ɲ",
)

if len(PHONEMES) != 123:
    raise RuntimeError(f"Expected 123 phoneme labels, found {len(PHONEMES)}")


class BrowserWav2Vec2(torch.nn.Module):
    """Give the ONNX graph a minimal one-input/one-output contract."""

    def __init__(self, model: Wav2Vec2ForCTC) -> None:
        super().__init__()
        self.model = model

    def forward(self, input_values: torch.Tensor) -> torch.Tensor:
        return self.model(input_values=input_values, return_dict=False)[0]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export the Vietnamese Wav2Vec2 CTC checkpoint for Transformers.js."
    )
    parser.add_argument("--model-id", default=DEFAULT_MODEL_ID)
    parser.add_argument(
        "--revision",
        default="main",
        help="Hugging Face branch, tag, or immutable commit SHA (default: main).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Destination model repository directory (default: {DEFAULT_OUTPUT_DIR}).",
    )
    parser.add_argument("--opset", type=int, default=17)
    parser.add_argument(
        "--skip-fp16",
        action="store_true",
        help="Do not create onnx/model_fp16.onnx (WebGPU build).",
    )
    parser.add_argument(
        "--skip-q8",
        action="store_true",
        help="Do not create onnx/model_quantized.onnx (WASM fallback build).",
    )
    parser.add_argument(
        "--skip-validation",
        action="store_true",
        help="Only export/check ONNX structure; do not run test inference.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace generated files in an existing output directory.",
    )
    return parser.parse_args()


def write_json(path: Path, payload: Any) -> None:
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def prepare_output(output_dir: Path, overwrite: bool) -> tuple[Path, Path, Path]:
    output_dir = output_dir.resolve()
    onnx_dir = output_dir / "onnx"
    fp32_path = onnx_dir / "model.onnx"
    fp16_path = onnx_dir / "model_fp16.onnx"
    q8_path = onnx_dir / "model_quantized.onnx"
    generated = (
        fp32_path,
        fp16_path,
        q8_path,
        output_dir / "config.json",
        output_dir / "preprocessor_config.json",
        output_dir / "vocab.json",
        output_dir / "phonemes.json",
        output_dir / "browser_model_manifest.json",
    )
    existing = [path for path in generated if path.exists()]
    if existing and not overwrite:
        names = ", ".join(str(path.relative_to(output_dir)) for path in existing)
        raise FileExistsError(
            f"Generated files already exist ({names}). Use --overwrite to replace them."
        )
    if overwrite:
        for path in existing:
            path.unlink()
    output_dir.mkdir(parents=True, exist_ok=True)
    onnx_dir.mkdir(parents=True, exist_ok=True)
    return fp32_path, fp16_path, q8_path


def download_and_write_metadata(
    model_id: str, revision: str, output_dir: Path
) -> None:
    print("[1/6] Downloading public config files…")
    config_source = Path(
        hf_hub_download(
            repo_id=model_id,
            filename="config.json",
            revision=revision,
            token=False,
        )
    )
    preprocessor_source = Path(
        hf_hub_download(
            repo_id=model_id,
            filename="preprocessor_config.json",
            revision=revision,
            token=False,
        )
    )

    config = json.loads(config_source.read_text(encoding="utf-8"))
    checkpoint_vocab_size = int(config.get("vocab_size", -1))
    if checkpoint_vocab_size != len(PHONEMES):
        raise ValueError(
            "Checkpoint/config vocabulary mismatch: "
            f"config vocab_size={checkpoint_vocab_size}, labels={len(PHONEMES)}"
        )

    config["vocab_size"] = len(PHONEMES)
    config["pad_token_id"] = BLANK_TOKEN_ID
    config["id2label"] = {str(index): token for index, token in enumerate(PHONEMES)}
    config["label2id"] = {token: index for index, token in enumerate(PHONEMES)}
    write_json(output_dir / "config.json", config)

    preprocessor = json.loads(preprocessor_source.read_text(encoding="utf-8"))
    source_sample_rate = int(preprocessor.get("sampling_rate", SAMPLE_RATE))
    if source_sample_rate != SAMPLE_RATE:
        raise ValueError(
            f"Expected a {SAMPLE_RATE} Hz feature extractor, found {source_sample_rate} Hz"
        )
    preprocessor["sampling_rate"] = SAMPLE_RATE
    preprocessor["do_normalize"] = True
    preprocessor["return_attention_mask"] = False
    write_json(output_dir / "preprocessor_config.json", preprocessor)

    vocab = {token: index for index, token in enumerate(PHONEMES)}
    write_json(output_dir / "vocab.json", vocab)
    write_json(
        output_dir / "phonemes.json",
        {
            "blank_token_id": BLANK_TOKEN_ID,
            "sampling_rate": SAMPLE_RATE,
            "labels": list(PHONEMES),
        },
    )


def export_fp32(
    model_id: str, revision: str, destination: Path, opset: int
) -> None:
    print("[2/6] Loading checkpoint as FP32 on CPU…")
    config = AutoConfig.from_pretrained(model_id, revision=revision, token=False)
    config._attn_implementation = "eager"
    model = Wav2Vec2ForCTC.from_pretrained(
        model_id,
        revision=revision,
        token=False,
        config=config,
        torch_dtype=torch.float32,
    )
    model = model.cpu().float().eval()
    wrapper = BrowserWav2Vec2(model).eval()
    dummy_audio = torch.zeros((1, SAMPLE_RATE), dtype=torch.float32)

    print(f"[3/6] Exporting FP32 ONNX (opset {opset})…")
    with torch.inference_mode():
        torch.onnx.export(
            wrapper,
            (dummy_audio,),
            str(destination),
            input_names=["input_values"],
            output_names=["logits"],
            dynamic_axes={
                "input_values": {0: "batch_size", 1: "audio_sequence_length"},
                "logits": {0: "batch_size", 1: "feature_sequence_length"},
            },
            export_params=True,
            do_constant_folding=True,
            opset_version=opset,
        )
    onnx.checker.check_model(str(destination), full_check=False)
    del dummy_audio, wrapper, model
    gc.collect()


def export_fp16(source: Path, destination: Path) -> None:
    print("[4/6] Creating FP16 ONNX for WebGPU…")
    model = onnx.load(str(source))
    model_fp16 = float16.convert_float_to_float16(
        model,
        keep_io_types=True,
        disable_shape_infer=True,
    )
    onnx.checker.check_model(model_fp16, full_check=False)
    onnx.save_model(model_fp16, str(destination))
    del model_fp16, model
    gc.collect()


def export_q8(source: Path, destination: Path) -> None:
    print("[5/6] Creating dynamic-Q8 ONNX for the WASM fallback…")
    quantize_dynamic(
        model_input=str(source),
        model_output=str(destination),
        per_channel=True,
        reduce_range=False,
        weight_type=QuantType.QInt8,
        op_types_to_quantize=["MatMul", "Gemm"],
    )
    onnx.checker.check_model(str(destination), full_check=False)


def make_validation_audio() -> np.ndarray:
    """Produce deterministic speech-like input without shipping user audio."""
    time = np.arange(SAMPLE_RATE * 2, dtype=np.float32) / SAMPLE_RATE
    envelope = np.minimum(time / 0.08, 1.0) * np.minimum((2.0 - time) / 0.08, 1.0)
    audio = envelope * (
        0.14 * np.sin(2 * np.pi * 145 * time)
        + 0.06 * np.sin(2 * np.pi * 290 * time)
        + 0.03 * np.sin(2 * np.pi * 580 * time)
    )
    # Match Wav2Vec2FeatureExtractor(do_normalize=True).
    audio = (audio - audio.mean()) / np.sqrt(audio.var() + 1e-7)
    return audio.astype(np.float32, copy=False)[None, :]


def ctc_decode(token_ids: Iterable[int]) -> list[int]:
    decoded: list[int] = []
    previous = BLANK_TOKEN_ID
    for token_id in token_ids:
        token_id = int(token_id)
        if token_id == BLANK_TOKEN_ID:
            previous = BLANK_TOKEN_ID
            continue
        if token_id != previous:
            decoded.append(token_id)
        previous = token_id
    return decoded


def edit_distance(left: Sequence[int], right: Sequence[int]) -> int:
    previous = list(range(len(right) + 1))
    for row_index, left_item in enumerate(left, start=1):
        current = [row_index]
        for column_index, right_item in enumerate(right, start=1):
            current.append(
                min(
                    current[-1] + 1,
                    previous[column_index] + 1,
                    previous[column_index - 1] + (left_item != right_item),
                )
            )
        previous = current
    return previous[-1]


def run_one_model(path: Path, audio: np.ndarray) -> dict[str, Any]:
    session_options = ort.SessionOptions()
    session_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    session = ort.InferenceSession(
        str(path),
        sess_options=session_options,
        providers=["CPUExecutionProvider"],
    )
    inputs = session.get_inputs()
    if len(inputs) != 1 or inputs[0].name != "input_values":
        raise ValueError(
            f"{path.name}: expected one 'input_values' input, got "
            f"{[item.name for item in inputs]}"
        )
    output_names = [item.name for item in session.get_outputs()]
    if "logits" not in output_names:
        raise ValueError(f"{path.name}: expected a 'logits' output, got {output_names}")

    logits = session.run(["logits"], {"input_values": audio})[0]
    if logits.ndim != 3 or logits.shape[0] != 1 or logits.shape[-1] != len(PHONEMES):
        raise ValueError(
            f"{path.name}: expected logits [1, frames, {len(PHONEMES)}], "
            f"got {list(logits.shape)}"
        )
    if not np.isfinite(logits).all():
        raise ValueError(f"{path.name}: logits contain NaN or infinity")

    token_ids = np.argmax(logits[0], axis=-1)
    decoded = ctc_decode(token_ids)
    row_max = np.max(logits[0], axis=-1, keepdims=True)
    exp_shifted = np.exp(logits[0] - row_max)
    max_probabilities = 1.0 / np.sum(exp_shifted, axis=-1)
    result = {
        "file": f"onnx/{path.name}",
        "size_bytes": path.stat().st_size,
        "logits_shape": list(logits.shape),
        "decoded_token_ids": decoded,
        "decoded_phonemes": [PHONEMES[token_id] for token_id in decoded],
        "mean_frame_confidence": round(float(np.mean(max_probabilities)), 6),
    }
    del session
    gc.collect()
    return result


def validate_models(paths: Sequence[Path]) -> list[dict[str, Any]]:
    print("[6/6] Validating generated graphs with ONNX Runtime…")
    audio = make_validation_audio()
    results = [run_one_model(path, audio) for path in paths]
    reference = results[0]["decoded_token_ids"]
    for result in results:
        candidate = result["decoded_token_ids"]
        denominator = max(len(reference), len(candidate), 1)
        result["ctc_edit_distance_from_fp32"] = edit_distance(reference, candidate)
        result["ctc_edit_ratio_from_fp32"] = round(
            result["ctc_edit_distance_from_fp32"] / denominator,
            6,
        )
        phonemes = " ".join(result["decoded_phonemes"]) or "(blank only)"
        print(
            f"  ✓ {result['file']}: {result['logits_shape']}, "
            f"mean confidence={result['mean_frame_confidence']}, CTC={phonemes}"
        )
        if result["ctc_edit_ratio_from_fp32"] > 0.35:
            print(
                "    WARNING: decoded sequence differs substantially from FP32 on the "
                "synthetic smoke-test audio.",
                file=sys.stderr,
            )
    return results


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_manifest(
    output_dir: Path,
    model_id: str,
    revision: str,
    opset: int,
    model_paths: Sequence[Path],
    validation: Sequence[dict[str, Any]],
) -> None:
    files = []
    for path in model_paths:
        files.append(
            {
                "path": path.relative_to(output_dir).as_posix(),
                "size_bytes": path.stat().st_size,
                "sha256": sha256_file(path),
            }
        )
    write_json(
        output_dir / "browser_model_manifest.json",
        {
            "schema_version": 1,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source_model": model_id,
            "source_revision_requested": revision,
            "task": "automatic-speech-recognition",
            "architecture": "Wav2Vec2ForCTC",
            "sampling_rate": SAMPLE_RATE,
            "vocab_size": len(PHONEMES),
            "blank_token_id": BLANK_TOKEN_ID,
            "opset": opset,
            "files": files,
            "validation": list(validation),
        },
    )


def main() -> int:
    args = parse_args()
    output_dir = args.output_dir.resolve()
    fp32_path, fp16_path, q8_path = prepare_output(output_dir, args.overwrite)
    download_and_write_metadata(args.model_id, args.revision, output_dir)
    export_fp32(args.model_id, args.revision, fp32_path, args.opset)

    model_paths = [fp32_path]
    if not args.skip_fp16:
        export_fp16(fp32_path, fp16_path)
        model_paths.append(fp16_path)
    if not args.skip_q8:
        export_q8(fp32_path, q8_path)
        model_paths.append(q8_path)

    validation: list[dict[str, Any]] = []
    if not args.skip_validation:
        validation = validate_models(model_paths)
    else:
        print("[6/6] Runtime validation skipped by request.")
        for path in model_paths:
            onnx.checker.check_model(str(path), full_check=False)

    write_manifest(
        output_dir,
        args.model_id,
        args.revision,
        args.opset,
        model_paths,
        validation,
    )
    print(f"\nDone. Browser-ready model repository: {output_dir}")
    print("No files were uploaded.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (FileExistsError, ValueError, RuntimeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(2) from error
