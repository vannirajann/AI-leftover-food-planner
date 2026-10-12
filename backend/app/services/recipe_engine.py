from __future__ import annotations

from datetime import date, timedelta

seed_recipes = [
    {
        "id": 1,
        "name": "Tomato Rice",
        "description": "A quick, tangy rice dish using tomato, onion, and spice.",
        "category": "rice",
        "cuisine": "Indian",
        "vegetarian": True,
        "prep_time": 10,
        "cook_time": 20,
        "servings": 2,
        "ingredients": ["rice", "tomato", "onion", "oil", "salt", "mustard seeds"],
        "instructions": ["Cook rice.", "Sauté onion and tomato.", "Add rice and seasonings.", "Serve warm."],
        "nutrition": {"calories": 320, "protein": 8, "carbs": 45, "fat": 10},
        "difficulty": "easy",
    },
    {
        "id": 2,
        "name": "Vegetable Rice",
        "description": "Colorful rice with mixed vegetables and herbs.",
        "category": "rice",
        "cuisine": "Indian",
        "vegetarian": True,
        "prep_time": 12,
        "cook_time": 25,
        "servings": 3,
        "ingredients": ["rice", "carrot", "onion", "tomato", "peas", "oil"],
        "instructions": ["Boil rice.", "Cook vegetables.", "Combine and season.", "Serve."],
        "nutrition": {"calories": 360, "protein": 9, "carbs": 50, "fat": 9},
        "difficulty": "easy",
    },
    {
        "id": 3,
        "name": "Fried Rice",
        "description": "Classic leftover rice stir-fry with vegetables.",
        "category": "rice",
        "cuisine": "Chinese",
        "vegetarian": True,
        "prep_time": 15,
        "cook_time": 20,
        "servings": 2,
        "ingredients": ["rice", "onion", "carrot", "tomato", "soy sauce", "egg"],
        "instructions": ["Sauté onion and vegetables.", "Add rice.", "Mix in soy sauce and egg.", "Serve."],
        "nutrition": {"calories": 410, "protein": 12, "carbs": 56, "fat": 11},
        "difficulty": "medium",
    },
    {
        "id": 4,
        "name": "Upma",
        "description": "Savory semolina breakfast cooked with vegetables.",
        "category": "breakfast",
        "cuisine": "Indian",
        "vegetarian": True,
        "prep_time": 10,
        "cook_time": 20,
        "servings": 2,
        "ingredients": ["semolina", "onion", "carrot", "tomato", "oil", "mustard seeds"],
        "instructions": ["Roast semolina.", "Sauté vegetables.", "Combine with hot water.", "Season and serve."],
        "nutrition": {"calories": 280, "protein": 7, "carbs": 38, "fat": 8},
        "difficulty": "easy",
    },
    {
        "id": 5,
        "name": "Vegetable Curry",
        "description": "Comforting curry packed with seasonal vegetables.",
        "category": "curry",
        "cuisine": "Indian",
        "vegetarian": True,
        "prep_time": 15,
        "cook_time": 30,
        "servings": 4,
        "ingredients": ["potato", "tomato", "onion", "carrot", "peas", "coconut milk"],
        "instructions": ["Cook onion and tomato.", "Add vegetables.", "Simmer with spice.", "Serve with rice."],
        "nutrition": {"calories": 390, "protein": 10, "carbs": 44, "fat": 15},
        "difficulty": "medium",
    },
    {
        "id": 6,
        "name": "Potato Fry",
        "description": "Crispy pan-fried potato slices with masala.",
        "category": "side",
        "cuisine": "Indian",
        "vegetarian": True,
        "prep_time": 10,
        "cook_time": 20,
        "servings": 2,
        "ingredients": ["potato", "onion", "chili", "oil", "salt"],
        "instructions": ["Slice potatoes.", "Fry until crisp.", "Season and serve."],
        "nutrition": {"calories": 260, "protein": 5, "carbs": 30, "fat": 12},
        "difficulty": "easy",
    },
    {
        "id": 7,
        "name": "Lemon Rice",
        "description": "Refreshing rice flavored with lemon and curry leaves.",
        "category": "rice",
        "cuisine": "Indian",
        "vegetarian": True,
        "prep_time": 10,
        "cook_time": 15,
        "servings": 2,
        "ingredients": ["rice", "lemon", "mustard seeds", "peanuts", "salt"],
        "instructions": ["Cook rice.", "Mix lemon juice and seasoning.", "Toss together and serve."],
        "nutrition": {"calories": 300, "protein": 7, "carbs": 40, "fat": 9},
        "difficulty": "easy",
    },
    {
        "id": 8,
        "name": "Curd Rice",
        "description": "Cool yogurt rice for a light and soothing meal.",
        "category": "rice",
        "cuisine": "Indian",
        "vegetarian": True,
        "prep_time": 10,
        "cook_time": 10,
        "servings": 2,
        "ingredients": ["rice", "curd", "cucumber", "mustard seeds", "salt"],
        "instructions": ["Prepare rice.", "Mix with curd and vegetables.", "Season and serve chilled."],
        "nutrition": {"calories": 240, "protein": 9, "carbs": 30, "fat": 6},
        "difficulty": "easy",
    },
    {
        "id": 9,
        "name": "Fruit Salad",
        "description": "Fresh fruit bowl for a healthy and quick snack.",
        "category": "salad",
        "cuisine": "International",
        "vegetarian": True,
        "prep_time": 10,
        "cook_time": 0,
        "servings": 2,
        "ingredients": ["apple", "banana", "orange", "yogurt", "honey"],
        "instructions": ["Chop fruits.", "Add yogurt and honey.", "Serve chilled."],
        "nutrition": {"calories": 210, "protein": 4, "carbs": 35, "fat": 3},
        "difficulty": "easy",
    },
    {
        "id": 10,
        "name": "Vegetable Soup",
        "description": "A nourishing soup using leftover vegetables.",
        "category": "soup",
        "cuisine": "International",
        "vegetarian": True,
        "prep_time": 15,
        "cook_time": 25,
        "servings": 3,
        "ingredients": ["tomato", "onion", "carrot", "potato", "garlic", "stock"],
        "instructions": ["Sauté onion and garlic.", "Add vegetables and stock.", "Simmer until soft.", "Blend if preferred."],
        "nutrition": {"calories": 190, "protein": 5, "carbs": 28, "fat": 4},
        "difficulty": "easy",
    },
    {
        "id": 11,
        "name": "Sandwiches",
        "description": "Quick sandwiches with fresh vegetables and spread.",
        "category": "snack",
        "cuisine": "International",
        "vegetarian": True,
        "prep_time": 10,
        "cook_time": 5,
        "servings": 2,
        "ingredients": ["bread", "tomato", "carrot", "lettuce", "butter"],
        "instructions": ["Toast bread.", "Layer vegetables and spread.", "Serve whole or cut."],
        "nutrition": {"calories": 280, "protein": 8, "carbs": 34, "fat": 9},
        "difficulty": "easy",
    },
    {
        "id": 12,
        "name": "Omelette",
        "description": "Protein-rich and fast breakfast option.",
        "category": "breakfast",
        "cuisine": "International",
        "vegetarian": True,
        "prep_time": 5,
        "cook_time": 10,
        "servings": 2,
        "ingredients": ["egg", "onion", "tomato", "spinach", "oil"],
        "instructions": ["Whisk eggs.", "Cook with vegetables.", "Fold and serve."],
        "nutrition": {"calories": 260, "protein": 17, "carbs": 5, "fat": 18},
        "difficulty": "easy",
    },
    {
        "id": 13,
        "name": "Pasta Primavera",
        "description": "Pasta with seasonal vegetables in a light sauce.",
        "category": "pasta",
        "cuisine": "Italian",
        "vegetarian": True,
        "prep_time": 10,
        "cook_time": 20,
        "servings": 3,
        "ingredients": ["pasta", "tomato", "onion", "carrot", "olive oil", "garlic"],
        "instructions": ["Boil pasta.", "Cook vegetables.", "Combine with sauce.", "Serve hot."],
        "nutrition": {"calories": 420, "protein": 11, "carbs": 60, "fat": 12},
        "difficulty": "medium",
    },
]


def compute_match_percentage(recipe: dict, pantry: dict[str, int]) -> tuple[int, list[str], list[str]]:
    available = []
    missing = []
    recipe_ing = recipe.get("ingredients", [])
    for ingredient in recipe_ing:
        if ingredient.lower() in pantry:
            available.append(ingredient.lower())
        else:
            missing.append(ingredient.lower())

    percentage = int((len(available) / len(recipe_ing)) * 100) if recipe_ing else 0
    return percentage, available, missing


def build_recommendations(ingredients: list[str], cuisine: str | None = None) -> list[dict]:
    pantry = {ingredient.lower(): 1 for ingredient in ingredients}
    recommendations = []
    for recipe in seed_recipes:
        if cuisine and recipe["cuisine"].lower() != cuisine.lower():
            continue
        match, available, missing = compute_match_percentage(recipe, pantry)
        urgency_bonus = 0
        for item in available:
            if item in {"tomato", "banana", "rice", "potato", "onion", "carrot"}:
                urgency_bonus += 3
        score = match + urgency_bonus
        recommendations.append(
            {
                "recipe": recipe,
                "match_percentage": match,
                "score": score,
                "available_ingredients": available,
                "missing_ingredients": missing,
            }
        )
    recommendations.sort(key=lambda item: (-item["score"], -item["match_percentage"], item["recipe"]["name"]))
    return recommendations


def get_storage_recommendations() -> list[dict]:
    return [
        {"ingredient": "Tomato", "location": "Counter or fridge", "duration": "3-5 days", "tip": "Keep away from direct sunlight unless fully ripe."},
        {"ingredient": "Rice", "location": "Air-tight container in pantry", "duration": "1-2 days cooked, 6-12 months uncooked", "tip": "Cool cooked rice quickly and refrigerate within 1 hour."},
        {"ingredient": "Potato", "location": "Cool dark pantry", "duration": "1-2 weeks", "tip": "Do not refrigerate unless you intend to cook soon."},
        {"ingredient": "Banana", "location": "Counter", "duration": "2-5 days", "tip": "Separate from other fruits if ripening rapidly."},
        {"ingredient": "Milk & curd", "location": "Fridge", "duration": "3-7 days", "tip": "Use clean spoons and keep lids closed."},
    ]


def estimate_freshness(name: str, expiry_date: date | None) -> dict:
    if expiry_date is None:
        return {
            "status": "unknown",
            "label": "Estimate unavailable",
            "days_remaining": None,
            "message": "Freshness estimate is limited when no valid expiry date is recorded.",
        }
    today = date.today()
    delta = (expiry_date - today).days
    if delta < 0:
        return {
            "status": "expired",
            "label": "Expired",
            "days_remaining": delta,
            "message": "This item should be checked and discarded if it shows signs of spoilage.",
        }
    if delta <= 3:
        return {
            "status": "critical",
            "label": "Use soon",
            "days_remaining": delta,
            "message": "Use this ingredient soon and check for odor, texture, or mold before eating.",
        }
    if delta <= 7:
        return {
            "status": "moderate",
            "label": "Good but monitor",
            "days_remaining": delta,
            "message": "Store correctly and inspect before use.",
        }
    return {
        "status": "fresh",
        "label": "Fresh",
        "days_remaining": delta,
        "message": "No immediate issue detected from date-based estimate alone.",
    }
