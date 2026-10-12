from __future__ import annotations

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    dietary_focus: str | None = None
    city: str | None = None
    theme: str | None = None


class IngredientCreate(BaseModel):
    name: str
    category: str = "vegetable"
    quantity: float = 1.0
    unit: str = "kg"
    purchase_date: date | None = None
    expiry_date: date | None = None
    storage_location: str = "fridge"
    notes: str | None = None


class IngredientUpdate(IngredientCreate):
    pass


class IngredientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    quantity: float
    unit: str
    purchase_date: date | None = None
    expiry_date: date | None = None
    storage_location: str
    notes: str | None = None
    is_consumed: bool = False
    is_wasted: bool = False
    created_at: datetime


class RecipeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    category: str
    cuisine: str
    vegetarian: bool
    prep_time: int
    cook_time: int
    servings: int
    ingredients: list[str]
    instructions: list[str]
    nutrition: dict[str, Any]
    difficulty: str


class ShoppingItemCreate(BaseModel):
    name: str
    quantity: float = 1.0
    unit: str = "pcs"
    category: str = "groceries"
    purchased: bool = False


class ShoppingItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    quantity: float
    unit: str
    category: str
    purchased: bool
    created_at: datetime


class MealPlanCreate(BaseModel):
    day: str
    meal_type: str
    recipe_name: str
    notes: str | None = None


class MealPlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    day: str
    meal_type: str
    recipe_name: str
    notes: str | None = None
    created_at: datetime


class ScanResult(BaseModel):
    label: str
    prediction: str
    confidence: float
    source: str = "manual_fallback"
    recommended_action: str


class OcrResult(BaseModel):
    text: str
    detected_dates: list[str]
    expiry_date: str | None = None
    best_before: str | None = None
    packaging_note: str


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
