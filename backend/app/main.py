from __future__ import annotations

from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from .database import get_db, init_db
from .models import (
    FoodUsageRecord,
    FoodWasteRecord,
    Ingredient,
    MealPlan,
    Notification,
    Profile,
    Recipe,
    SavedRecipe,
    ScanHistory,
    ShoppingItem,
    User,
)
from .schemas import (
    IngredientCreate,
    IngredientOut,
    MealPlanCreate,
    MealPlanOut,
    NotificationOut,
    OcrResult,
    ProfileUpdate,
    RecipeOut,
    ScanResult,
    ShoppingItemCreate,
    ShoppingItemOut,
    Token,
    UserCreate,
    UserLogin,
    UserOut,
)
from .security import create_access_token, get_current_user, hash_password, verify_password
from .services.ai_service import infer_food_from_image, predict_food_from_label
from .services.ocr_service import analyze_ocr_text
from .services.recipe_engine import build_recommendations, get_storage_recommendations, seed_recipes, estimate_freshness

app = FastAPI(title="AI Leftover Food Planner", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    init_db()
    seed_database()


def seed_database() -> None:
    db = next(get_db())
    if db.query(Recipe).count() == 0:
        for recipe in seed_recipes:
            db.add(
                Recipe(
                    name=recipe["name"],
                    description=recipe["description"],
                    category=recipe["category"],
                    cuisine=recipe["cuisine"],
                    vegetarian=recipe["vegetarian"],
                    prep_time=recipe["prep_time"],
                    cook_time=recipe["cook_time"],
                    servings=recipe["servings"],
                    ingredients=recipe["ingredients"],
                    instructions=recipe["instructions"],
                    nutrition=recipe["nutrition"],
                    difficulty=recipe["difficulty"],
                )
            )
    demo_user = db.query(User).filter(User.email == "demo@leftover.ai").first()
    if demo_user is None:
        user = User(
            username="demo-user",
            email="demo@leftover.ai",
            password_hash=hash_password("Demo123!"),
            is_active=True,
        )
        db.add(user)
        db.flush()
        db.add(Profile(user_id=user.id, full_name="Demo User", dietary_focus="balanced", city="Pune", theme="light"))
        demo_ingredients = [
            Ingredient(name="Rice", category="grain", quantity=2.0, unit="kg", purchase_date=date.today() - timedelta(days=5), expiry_date=date.today() + timedelta(days=3), storage_location="pantry"),
            Ingredient(name="Tomato", category="vegetable", quantity=4.0, unit="pcs", purchase_date=date.today() - timedelta(days=2), expiry_date=date.today() + timedelta(days=2), storage_location="fridge"),
            Ingredient(name="Potato", category="vegetable", quantity=2.0, unit="kg", purchase_date=date.today() - timedelta(days=6), expiry_date=date.today() + timedelta(days=8), storage_location="pantry"),
            Ingredient(name="Banana", category="fruit", quantity=6.0, unit="pcs", purchase_date=date.today() - timedelta(days=1), expiry_date=date.today() + timedelta(days=2), storage_location="counter"),
            Ingredient(name="Carrot", category="vegetable", quantity=1.0, unit="kg", purchase_date=date.today() - timedelta(days=3), expiry_date=date.today() + timedelta(days=7), storage_location="fridge"),
        ]
        for item in demo_ingredients:
            item.user_id = user.id
            db.add(item)
        db.add(Notification(title="Expiry reminder", message="Rice and tomato are close to expiry. Plan a meal soon.", user_id=user.id, is_read=False))
        db.add(ShoppingItem(user_id=user.id, name="Onion", quantity=2.0, unit="kg", category="vegetable", purchased=False))
        db.add(ShoppingItem(user_id=user.id, name="Bread", quantity=1.0, unit="pack", category="grain", purchased=False))
        db.add(MealPlan(user_id=user.id, day="Monday", meal_type="Dinner", recipe_name="Tomato Rice"))
    db.commit()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "message": "AI Leftover Food Planner backend is running"}


@app.post("/api/auth/register", response_model=UserOut)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        username=payload.username,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        is_active=True,
    )
    db.add(user)
    db.flush()
    db.add(Profile(user_id=user.id, full_name=payload.username, dietary_focus="balanced", city="Pune", theme="light"))
    db.commit()
    db.refresh(user)
    return user


@app.post("/api/auth/login", response_model=Token)
def login_user(payload: UserLogin, db: Session = Depends(get_db)) -> dict[str, str]:
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}


@app.post("/api/auth/forgot-password")
def forgot_password(payload: UserLogin, db: Session = Depends(get_db)) -> dict[str, str]:
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        return {"message": "A demo-only reset link is not generated for unknown users."}
    return {
        "message": "Local demo mode: use the demo credentials to re-login. For a production app, a secure password reset token would be generated here.",
        "demo_email": "demo@leftover.ai",
        "demo_password": "Demo123!",
    }


@app.get("/api/profile/me", response_model=dict)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "is_active": current_user.is_active,
        "profile": {
            "full_name": profile.full_name if profile else current_user.username,
            "dietary_focus": profile.dietary_focus if profile else "balanced",
            "city": profile.city if profile else "Pune",
            "theme": profile.theme if profile else "light",
        },
    }


@app.put("/api/profile/me")
def update_profile(payload: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile is None:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    if payload.full_name is not None:
        profile.full_name = payload.full_name
    if payload.dietary_focus is not None:
        profile.dietary_focus = payload.dietary_focus
    if payload.city is not None:
        profile.city = payload.city
    if payload.theme is not None:
        profile.theme = payload.theme
    db.commit()
    return {"message": "Profile updated successfully"}


@app.get("/api/ingredients", response_model=list[IngredientOut])
def list_ingredients(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Ingredient]:
    return db.query(Ingredient).filter(Ingredient.user_id == current_user.id).order_by(Ingredient.created_at.desc()).all()


@app.post("/api/ingredients", response_model=IngredientOut)
def create_ingredient(payload: IngredientCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Ingredient:
    item = Ingredient(
        user_id=current_user.id,
        name=payload.name,
        category=payload.category,
        quantity=payload.quantity,
        unit=payload.unit,
        purchase_date=payload.purchase_date,
        expiry_date=payload.expiry_date,
        storage_location=payload.storage_location,
        notes=payload.notes or "",
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/ingredients/{ingredient_id}", response_model=IngredientOut)
def update_ingredient(ingredient_id: int, payload: IngredientCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Ingredient:
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id, Ingredient.user_id == current_user.id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    for field, value in payload.model_dump().items():
        setattr(ingredient, field, value)
    db.commit(); db.refresh(ingredient)
    return ingredient


@app.delete("/api/ingredients/{ingredient_id}")
def delete_ingredient(ingredient_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id, Ingredient.user_id == current_user.id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    db.delete(ingredient)
    db.commit()
    return {"message": "Ingredient removed"}


@app.get("/api/recipes", response_model=list[RecipeOut])
def list_recipes(db: Session = Depends(get_db)) -> list[Recipe]:
    return db.query(Recipe).all()


@app.get("/api/recipes/recommendations")
def recommend_recipes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    pantry_names = [ingredient.name for ingredient in db.query(Ingredient).filter(Ingredient.user_id == current_user.id).all()]
    recommendations = build_recommendations(pantry_names)
    payload = []
    for item in recommendations[:8]:
        payload.append(
            {
                "id": item["recipe"]["id"],
                "name": item["recipe"]["name"],
                "match_percentage": item["match_percentage"],
                "available_ingredients": item["available_ingredients"],
                "missing_ingredients": item["missing_ingredients"],
                "description": item["recipe"]["description"],
                "difficulty": item["recipe"]["difficulty"],
                "prep_time": item["recipe"]["prep_time"],
                "cook_time": item["recipe"]["cook_time"],
                "cuisine": item["recipe"]["cuisine"],
                "vegetarian": item["recipe"]["vegetarian"],
            }
        )
    return payload


@app.get("/api/recipes/{recipe_id}", response_model=RecipeOut)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)) -> Recipe:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@app.post("/api/recipes/{recipe_id}/save")
def save_recipe(recipe_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    existing = db.query(SavedRecipe).filter(SavedRecipe.user_id == current_user.id, SavedRecipe.recipe_id == recipe_id).first()
    if existing:
        return {"message": "Recipe already saved"}
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.add(SavedRecipe(user_id=current_user.id, recipe_id=recipe.id))
    db.commit()
    return {"message": "Recipe saved"}


@app.get("/api/saved-recipes")
def list_saved_recipes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    rows = db.query(SavedRecipe).filter(SavedRecipe.user_id == current_user.id).all()
    result = []
    for row in rows:
        recipe = db.query(Recipe).filter(Recipe.id == row.recipe_id).first()
        if recipe:
            result.append({"id": recipe.id, "name": recipe.name, "description": recipe.description, "cuisine": recipe.cuisine})
    return result


@app.get("/api/shopping-list")
def list_shopping_items(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ShoppingItemOut]:
    return db.query(ShoppingItem).filter(ShoppingItem.user_id == current_user.id).order_by(ShoppingItem.created_at.desc()).all()


@app.post("/api/shopping-list/items", response_model=ShoppingItemOut)
def create_shopping_item(payload: ShoppingItemCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ShoppingItem:
    item = ShoppingItem(
        user_id=current_user.id,
        name=payload.name,
        quantity=payload.quantity,
        unit=payload.unit,
        category=payload.category,
        purchased=payload.purchased,
    )
    db.add(item)
    db.commit(); db.refresh(item)
    return item


@app.put("/api/shopping-list/items/{item_id}", response_model=ShoppingItemOut)
def update_shopping_item(item_id: int, payload: ShoppingItemCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ShoppingItem:
    item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id, ShoppingItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    for field, value in payload.model_dump().items():
        setattr(item, field, value)
    db.commit(); db.refresh(item)
    return item


@app.delete("/api/shopping-list/items/{item_id}")
def delete_shopping_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id, ShoppingItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    db.delete(item); db.commit()
    return {"message": "Shopping item removed"}


@app.get("/api/meal-plans", response_model=list[MealPlanOut])
def list_meal_plans(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[MealPlan]:
    return db.query(MealPlan).filter(MealPlan.user_id == current_user.id).order_by(MealPlan.created_at.desc()).all()


@app.post("/api/meal-plans", response_model=MealPlanOut)
def create_meal_plan(payload: MealPlanCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MealPlan:
    item = MealPlan(user_id=current_user.id, day=payload.day, meal_type=payload.meal_type, recipe_name=payload.recipe_name, notes=payload.notes)
    db.add(item); db.commit(); db.refresh(item)
    return item


@app.delete("/api/meal-plans/{meal_plan_id}")
def delete_meal_plan(meal_plan_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    item = db.query(MealPlan).filter(MealPlan.id == meal_plan_id, MealPlan.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    db.delete(item); db.commit()
    return {"message": "Meal plan removed"}


@app.post("/api/scan/recognize")
def recognize_food(file: UploadFile | None = File(None), label: str = Form(""), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> ScanResult:
    raw_label = label or (file.filename if file else "rice")
    prediction = infer_food_from_image(file_path=None, filename=raw_label)
    db.add(
        ScanHistory(user_id=current_user.id, source="scanner", label=raw_label, prediction=prediction["prediction"], confidence=prediction["confidence"])
    )
    db.commit()
    return ScanResult(
        label=prediction["label"],
        prediction=prediction["prediction"],
        confidence=prediction["confidence"],
        source=prediction["source"],
        recommended_action=prediction["recommended_action"],
    )


@app.post("/api/scan/ocr", response_model=OcrResult)
def ocr_expiry_text(raw_text: str = Form("Best before 18/12/2026. Use by 25/12/2026."), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    parsed = analyze_ocr_text(raw_text or "Best before 18/12/2026. Use by 25/12/2026.")
    return parsed


@app.get("/api/freshness")
def freshness_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    items = db.query(Ingredient).filter(Ingredient.user_id == current_user.id).all()
    result = []
    for item in items:
        freshness = estimate_freshness(item.name, item.expiry_date)
        result.append({"ingredient": item.name, "expiry_date": item.expiry_date.isoformat() if item.expiry_date else None, **freshness})
    return result


@app.get("/api/storage/recommendations")
def storage_recommendations() -> list[dict[str, Any]]:
    return get_storage_recommendations()


@app.get("/api/notifications")
def notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[NotificationOut]:
    items = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    if not items:
        db.add(Notification(user_id=current_user.id, title="Pantry summary", message="You have ingredients close to expiry. Check your dashboard.", is_read=False))
        db.commit()
        items = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return items


@app.post("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    item = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Notification not found")
    item.is_read = True; db.commit()
    return {"message": "Notification marked as read"}


@app.post("/api/usage-history")
def record_usage(payload: dict[str, Any], current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, str]:
    name = payload.get("ingredient_name")
    quantity = float(payload.get("quantity", 1))
    record_type = payload.get("record_type", "consumed")
    if not name:
        raise HTTPException(status_code=400, detail="ingredient_name is required")
    if record_type == "wasted":
        db.add(FoodWasteRecord(user_id=current_user.id, ingredient_name=name, quantity=quantity, reason=payload.get("reason", "expired")))
    else:
        db.add(FoodUsageRecord(user_id=current_user.id, ingredient_name=name, quantity=quantity, record_type=record_type))
    db.commit()
    return {"message": "Usage recorded"}


@app.get("/api/analytics")
def analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    total_ingredients = db.query(Ingredient).filter(Ingredient.user_id == current_user.id).count()
    consumed = db.query(FoodUsageRecord).filter(FoodUsageRecord.user_id == current_user.id).count()
    wasted = db.query(FoodWasteRecord).filter(FoodWasteRecord.user_id == current_user.id).count()
    expiring_today = 0
    expiring_soon = 0
    for ingredient in db.query(Ingredient).filter(Ingredient.user_id == current_user.id).all():
        if ingredient.expiry_date:
            diff = (ingredient.expiry_date - date.today()).days
            if diff <= 0:
                expiring_today += 1
            elif diff <= 7:
                expiring_soon += 1
    utilization = round((consumed / max(total_ingredients + consumed, 1)) * 100)
    return {
        "cards": [
            {"label": "Total ingredients", "value": total_ingredients},
            {"label": "Consumed", "value": consumed},
            {"label": "Wasted", "value": wasted},
            {"label": "Expiring soon", "value": expiring_soon},
        ],
        "chart_data": [
            {"name": "Mon", "consumed": max(2, consumed), "wasted": max(1, wasted)},
            {"name": "Tue", "consumed": 4, "wasted": 1},
            {"name": "Wed", "consumed": 5, "wasted": 2},
            {"name": "Thu", "consumed": 3, "wasted": 1},
            {"name": "Fri", "consumed": 6, "wasted": 1},
            {"name": "Sat", "consumed": 7, "wasted": 2},
            {"name": "Sun", "consumed": 4, "wasted": 1},
        ],
        "utilization": utilization,
        "expiring_today": expiring_today,
        "expiring_soon": expiring_soon,
    }


@app.get("/api/usage-history")
def usage_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    consumed = db.query(FoodUsageRecord).filter(FoodUsageRecord.user_id == current_user.id).order_by(FoodUsageRecord.recorded_at.desc()).all()
    wasted = db.query(FoodWasteRecord).filter(FoodWasteRecord.user_id == current_user.id).order_by(FoodWasteRecord.recorded_at.desc()).all()
    history = []
    for item in consumed:
        history.append({"name": item.ingredient_name, "type": item.record_type, "quantity": item.quantity, "timestamp": item.recorded_at.isoformat()})
    for item in wasted:
        history.append({"name": item.ingredient_name, "type": "wasted", "quantity": item.quantity, "timestamp": item.recorded_at.isoformat()})
    return sorted(history, key=lambda x: x["timestamp"], reverse=True)


@app.get("/api/demo-user")
def demo_user_info() -> dict[str, str]:
    return {"email": "demo@leftover.ai", "password": "Demo123!"}


FRONTEND_STATIC_DIR = Path(__file__).resolve().parent / "static"


@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str) -> FileResponse:
    if full_path == "api" or full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")

    static_root = FRONTEND_STATIC_DIR.resolve()
    requested_file = (static_root / full_path).resolve()
    if static_root in requested_file.parents and requested_file.is_file():
        return FileResponse(requested_file)

    index_file = static_root / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Frontend build is not available")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
