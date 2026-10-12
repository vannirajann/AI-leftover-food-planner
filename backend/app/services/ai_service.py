from __future__ import annotations

import os
from pathlib import Path

SUPPORTED_LABELS = {
    "rice": "rice",
    "tomato": "tomato",
    "potato": "potato",
    "onion": "onion",
    "carrot": "carrot",
    "apple": "apple",
    "banana": "banana",
    "vegetable": "vegetable",
    "salad": "salad",
    "bread": "bread",
}


def normalize_label(label: str) -> str:
    cleaned = (label or "").strip().lower().replace("_", " ")
    for key, value in SUPPORTED_LABELS.items():
        if cleaned == key or key in cleaned:
            return value
    return cleaned or "unknown"


def predict_food_from_label(label: str) -> dict:
    normalized = normalize_label(label)
    if normalized in SUPPORTED_LABELS.values() and normalized != "unknown":
        return {
            "label": normalized,
            "prediction": normalized,
            "confidence": 0.87,
            "source": "manual_fallback",
            "recommended_action": "Ingredient added to pantry after confirmation.",
        }
    return {
        "label": "manual-confirmation",
        "prediction": "manual-confirmation",
        "confidence": 0.0,
        "source": "manual_fallback",
        "recommended_action": "No model prediction is available; please confirm the ingredient manually.",
    }


def infer_food_from_image(file_path: str | None = None, filename: str | None = None) -> dict:
    if file_path and os.path.exists(file_path):
        name = Path(file_path).name.lower()
    else:
        name = (filename or "").lower()
    return predict_food_from_label(name)
