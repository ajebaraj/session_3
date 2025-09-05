import os
import json
import logging
from typing import List, Dict, Any

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Hardcoded API key (replace with your actual key)
GOOGLE_API_KEY = "AIzaSyCMX4sOIAJAicpTbfpAZ2jGatJCNJ-Rkfk"


def create_app() -> Flask:
	app = Flask(__name__, static_folder="static", template_folder="templates")
	CORS(app)

	@app.route("/")
	def index():
		return render_template("index.html")

	@app.post("/generate_recipes")
	def generate_recipes():
		try:
			logger.info("Recipe generation request received")
			payload = request.get_json(force=True, silent=False)
			if not payload or "ingredients" not in payload:
				logger.warning("Missing 'ingredients' in request body")
				return jsonify({"error": "Missing 'ingredients' in request body"}), 400

			ingredients = payload.get("ingredients", [])
			if not isinstance(ingredients, list):
				logger.warning("'ingredients' must be a list of strings")
				return jsonify({"error": "'ingredients' must be a list of strings"}), 400

			# Enhanced validation and normalization
			original_count = len(ingredients)
			ingredients = [str(i).strip().lower() for i in ingredients if str(i).strip()]
			ingredients = list(set(ingredients))  # Remove duplicates
			
			if not ingredients:
				logger.warning("No valid ingredients provided")
				return jsonify({"error": "No valid ingredients provided"}), 400
			
			if len(ingredients) > 20:
				logger.warning(f"Too many ingredients: {len(ingredients)}")
				return jsonify({"error": "Maximum 20 ingredients allowed"}), 400
			
			logger.info(f"Processing {len(ingredients)} ingredients (from {original_count} submitted)")
			recipes = _fetch_recipes_from_gemini(ingredients)
			logger.info(f"Successfully generated {len(recipes)} recipes")
			return jsonify({"recipes": recipes})
		except Exception as exc:  # noqa: BLE001
			logger.error(f"Recipe generation failed: {str(exc)}")
			return jsonify({"error": "Failed to generate recipes", "detail": str(exc)}), 500

	return app


def _fetch_recipes_from_gemini(ingredients: List[str]) -> List[Dict[str, Any]]:
	"""Call Gemini API to generate 2-3 recipes. Falls back to simple mock on failure."""
	try:
		# Use hardcoded API key first, fallback to environment variable
		api_key = GOOGLE_API_KEY if GOOGLE_API_KEY != "YOUR_GOOGLE_API_KEY_HERE" else os.getenv("GOOGLE_API_KEY", "").strip()
		logger.info(f"Using API key (length: {len(api_key)})")
		
		if not api_key:
			logger.warning("No API key found, using fallback recipes")
			return _fallback_recipes(ingredients, reason="Missing API key")

		# Lazy import so that unit tests or environments without the package still run the app
		import google.generativeai as genai  # type: ignore

		logger.info("Configuring Gemini API...")
		genai.configure(api_key=api_key)
		model = genai.GenerativeModel("gemini-1.5-flash")

		prompt = _build_prompt(ingredients)
		logger.info("Sending request to Gemini API...")
		response = model.generate_content(prompt)
		text = (response.text or "").strip()
		logger.info(f"Received response from Gemini (length: {len(text)})")
		
		if not text:
			logger.warning("Empty response from Gemini")
			return _fallback_recipes(ingredients, reason="Empty response")

		# Try to parse as JSON first; if that fails, do a permissive extraction
		recipes = _parse_gemini_output(text)
		if not recipes:
			logger.warning("Could not parse Gemini response")
			return _fallback_recipes(ingredients, reason="Unparseable response")
		logger.info(f"Successfully parsed {len(recipes)} recipes from Gemini")
		return recipes
	except Exception as exc:  # noqa: BLE001
		logger.error(f"Exception in Gemini call: {exc}")
		return _fallback_recipes(ingredients, reason=f"Exception: {exc}")


def _build_prompt(ingredients: List[str]) -> str:
	"""Build an improved prompt for better recipe generation."""
	ingredient_list = ', '.join(ingredients)
	return (
		"You are an expert chef and recipe developer. Create exactly 3 diverse, practical recipes "
		"using these ingredients: {ingredient_list}\n\n"
		"Requirements:\n"
		"- Each recipe should be distinct (different cooking methods/styles)\n"
		"- Include the provided ingredients prominently\n"
		"- Add common pantry staples (oil, salt, pepper, garlic, onions, herbs, spices)\n"
		"- Make recipes practical for home cooking\n"
		"- Provide clear, numbered cooking steps (5-8 steps each)\n\n"
		"Return ONLY valid JSON in this exact format:\n"
		"{{\n"
		'  "recipes": [\n'
		'    {{ "name": "Recipe Name", "shortDescription": "Brief description", "ingredients": ["ingredient 1", "ingredient 2"], "steps": ["Step 1", "Step 2"], "stockImageUrl": "https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Recipe+Name" }}\n'
		"  ]\n"
		"}}\n\n"
		"Use placeholder images: https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=<Recipe+Name>"
	).format(ingredient_list=ingredient_list)


def _parse_gemini_output(text: str) -> List[Dict[str, Any]]:
	# Try direct JSON
	try:
		obj = json.loads(text)
		recipes = obj.get("recipes") if isinstance(obj, dict) else None
		if isinstance(recipes, list) and recipes:
			return _normalize_recipes(recipes)
	except Exception:
		pass

	# Try to extract fenced code block JSON
	for fence in ["```json", "```"]:
		if fence in text:
			try:
				chunk = text.split(fence, 1)[1]
				chunk = chunk.split("```", 1)[0]
				obj = json.loads(chunk)
				recipes = obj.get("recipes") if isinstance(obj, dict) else None
				if isinstance(recipes, list) and recipes:
					return _normalize_recipes(recipes)
			except Exception:
				continue

	return []


def _normalize_recipes(recipes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
	standardized: List[Dict[str, Any]] = []
	for r in recipes[:3]:
		name = str(r.get("name", "Untitled Recipe")).strip() or "Untitled Recipe"
		desc = str(r.get("shortDescription", "")).strip()
		ingredients = r.get("ingredients")
		if not isinstance(ingredients, list):
			ingredients = [str(ingredients)] if ingredients else []
		ingredients = [str(i).strip() for i in ingredients if str(i).strip()]
		steps = r.get("steps")
		if not isinstance(steps, list):
			steps = [str(steps)] if steps else []
		steps = [str(s).strip() for s in steps if str(s).strip()]
		image = str(r.get("stockImageUrl", "")).strip()
		if not image:
			# Use a reliable placeholder service
			image = f"https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text={name.replace(' ', '+')}"
		standardized.append(
			{"name": name, "shortDescription": desc, "ingredients": ingredients, "steps": steps, "stockImageUrl": image}
		)
	return standardized


def _fallback_recipes(ingredients: List[str], reason: str) -> List[Dict[str, Any]]:
	base = ", ".join(ingredients[:5])
	return [
		{
			"name": "Hearty Pantry Stir-Fry",
			"shortDescription": f"Quick stir-fry using {base} and pantry staples.",
			"ingredients": [
				"2 tbsp vegetable oil",
				"2 cloves garlic, minced",
				"1 onion, sliced",
				"2 tbsp soy sauce",
				"Salt and pepper to taste",
				base
			],
			"steps": [
				"Prep and slice all vegetables and proteins.",
				"Heat oil in a large skillet over medium-high heat.",
				"Stir-fry aromatics, then add remaining ingredients.",
				"Season with soy sauce, salt, and pepper.",
				"Serve hot over rice or noodles.",
			],
			"stockImageUrl": "https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Stir+Fry",
		},
		{
			"name": "Rustic One-Pot Rice",
			"shortDescription": f"Comforting one-pot rice featuring {base}.",
			"ingredients": [
				"1 cup rice",
				"2 cups water or broth",
				"2 tbsp olive oil",
				"1 onion, diced",
				"2 cloves garlic, minced",
				"Salt and pepper to taste",
				base
			],
			"steps": [
				"Rinse rice until water runs clear.",
				"Sauté aromatics, add vegetables and proteins.",
				"Add rice and water/broth; bring to a boil.",
				"Simmer covered until rice is tender.",
				"Fluff and adjust seasoning.",
			],
			"stockImageUrl": "https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Rice+Dish",
		},
		{
			"name": "Cheesy Baked Casserole",
			"shortDescription": f"Golden, bubbly casserole built around {base}.",
			"ingredients": [
				"1 cup shredded cheese",
				"2 tbsp butter",
				"1/4 cup breadcrumbs",
				"2 cloves garlic, minced",
				"Salt and pepper to taste",
				base
			],
			"steps": [
				"Preheat oven to 190°C (375°F).",
				"Layer ingredients in a baking dish with cheese.",
				"Bake 20-30 minutes until browned and bubbly.",
				"Rest 5 minutes before serving.",
			],
			"stockImageUrl": "https://via.placeholder.com/400x400/FFE66D/333333?text=Casserole",
		},
	]


if __name__ == "__main__":
	port = int(os.getenv("PORT", "5000"))
	app = create_app()
	app.run(host="0.0.0.0", port=port, debug=True)


