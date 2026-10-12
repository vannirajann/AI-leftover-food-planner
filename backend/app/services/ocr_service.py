from __future__ import annotations

import re
from datetime import datetime

DATE_PATTERN = re.compile(r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})")


def extract_dates(text: str) -> list[str]:
    matches = DATE_PATTERN.findall(text)
    dates: list[str] = []
    for match in matches:
        value = match[0] if isinstance(match, tuple) else match
        cleaned = value.strip()
        if cleaned and cleaned not in dates:
            dates.append(cleaned)
    return dates


def parse_best_before_dates(raw_text: str) -> dict:
    dates = extract_dates(raw_text)
    expiry = dates[0] if dates else None
    best_before = dates[1] if len(dates) > 1 else None
    return {
        "text": raw_text,
        "detected_dates": dates,
        "expiry_date": expiry,
        "best_before": best_before,
        "packaging_note": "OCR results are estimates; confirm manually before using this date for safety decisions.",
    }


def analyze_ocr_text(raw_text: str) -> dict:
    parsed = parse_best_before_dates(raw_text)
    return {
        "text": parsed["text"],
        "detected_dates": parsed["detected_dates"],
        "expiry_date": parsed["expiry_date"],
        "best_before": parsed["best_before"],
        "packaging_note": parsed["packaging_note"],
    }
