const DEFAULT_INGREDIENTS = [
	// Fruits
	"apple", "banana", "orange", "strawberry", "blueberry", "raspberry", "blackberry",
	"grape", "peach", "pear", "plum", "cherry", "pineapple", "mango", "kiwi",
	"avocado", "coconut", "lime", "lemon", "grapefruit", "tangerine", "clementine",
	"apricot", "fig", "date", "raisin", "cranberry", "pomegranate", "watermelon",
	"cantaloupe", "honeydew", "papaya", "guava", "passion fruit", "dragon fruit",
	
	// Vegetables
	"tomato", "onion", "garlic", "bell pepper", "potato", "carrot", "spinach",
	"mushroom", "broccoli", "cauliflower", "cabbage", "lettuce", "kale", "arugula",
	"cucumber", "zucchini", "squash", "eggplant", "asparagus", "artichoke",
	"celery", "radish", "turnip", "beet", "parsnip", "rutabaga", "jicama",
	"watercress", "endive", "escarole", "chard", "collard greens", "mustard greens",
	"bok choy", "napa cabbage", "daikon", "fennel", "leek", "shallot", "scallion",
	"chive", "ginger", "turmeric", "horseradish", "wasabi", "bamboo shoot",
	
	// Proteins
	"chicken", "beef", "pork", "lamb", "turkey", "duck", "goose", "quail",
	"fish", "salmon", "tuna", "cod", "halibut", "mackerel", "sardine",
	"shrimp", "crab", "lobster", "clam", "mussel", "oyster", "scallop",
	"egg", "bacon", "ham", "sausage", "pepperoni", "salami", "prosciutto",
	"tofu", "tempeh", "seitan", "edamame", "lentil", "chickpea", "black bean",
	"kidney bean", "pinto bean", "navy bean", "lima bean", "split pea",
	
	// Grains & Starches
	"rice", "pasta", "noodles", "bread", "quinoa", "couscous", "barley",
	"oats", "oatmeal", "wheat", "flour", "cornmeal", "polenta", "grits",
	"bulgur", "farro", "millet", "amaranth", "buckwheat", "rye", "spelt",
	"potato", "sweet potato", "yam", "cassava", "taro", "plantain",
	
	// Dairy & Alternatives
	"milk", "cheese", "yogurt", "butter", "cream", "half and half", "heavy cream",
	"buttermilk", "sour cream", "cream cheese", "cottage cheese", "ricotta",
	"mozzarella", "cheddar", "parmesan", "feta", "blue cheese", "gouda",
	"swiss", "provolone", "brie", "camembert", "manchego", "pecorino",
	"almond milk", "coconut milk", "oat milk", "soy milk", "cashew milk",
	"rice milk", "hemp milk", "macadamia milk", "hazelnut milk",
	
	// Nuts & Seeds
	"almond", "walnut", "pecan", "cashew", "pistachio", "hazelnut", "macadamia",
	"pine nut", "peanut", "sunflower seed", "pumpkin seed", "sesame seed",
	"chia seed", "flax seed", "hemp seed", "poppy seed", "quinoa",
	
	// Herbs & Spices
	"basil", "thyme", "rosemary", "oregano", "parsley", "cilantro", "mint",
	"dill", "sage", "bay leaf", "tarragon", "marjoram", "chive", "scallion",
	"garlic", "ginger", "turmeric", "cumin", "coriander", "cardamom",
	"cinnamon", "nutmeg", "allspice", "clove", "vanilla", "paprika",
	"chili powder", "cayenne", "black pepper", "white pepper", "salt",
	"sea salt", "kosher salt", "himalayan salt", "msg", "bouillon",
	
	// Oils & Fats
	"olive oil", "vegetable oil", "canola oil", "coconut oil", "avocado oil",
	"sesame oil", "peanut oil", "sunflower oil", "grapeseed oil", "butter",
	"ghee", "lard", "shortening", "margarine",
	
	// Sweeteners
	"sugar", "brown sugar", "powdered sugar", "honey", "maple syrup",
	"agave nectar", "stevia", "splenda", "aspartame", "molasses",
	"corn syrup", "high fructose corn syrup", "date syrup", "coconut sugar",
	
	// Condiments & Sauces
	"ketchup", "mustard", "mayonnaise", "soy sauce", "worcestershire sauce",
	"hot sauce", "sriracha", "tabasco", "vinegar", "balsamic vinegar",
	"apple cider vinegar", "rice vinegar", "white vinegar", "red wine vinegar",
	"fish sauce", "oyster sauce", "hoisin sauce", "teriyaki sauce",
	"bbq sauce", "ranch dressing", "caesar dressing", "italian dressing",
	"thousand island", "blue cheese dressing", "honey mustard",
	
	// Other Common Ingredients
	"chocolate", "cocoa powder", "vanilla extract", "almond extract",
	"lemon juice", "lime juice", "orange juice", "apple juice",
	"tomato paste", "tomato sauce", "crushed tomato", "sun dried tomato",
	"anchovy", "capers", "olive", "pickle", "relish", "chutney",
	"jam", "jelly", "marmalade", "nutella", "peanut butter", "almond butter",
	"tahini", "hummus", "guacamole", "salsa", "pesto", "chimichurri"
];

// State management
let selectedIngredients = new Set();
let favorites = JSON.parse(localStorage.getItem('recipeFavorites') || '[]');
let currentRecipes = [];
let lastGeneratedRecipes = []; // Track the last generated recipes

function $(id) { return document.getElementById(id); }

// Immediately hide loading overlay to prevent it showing on page load
if (typeof document !== 'undefined') {
	document.addEventListener('DOMContentLoaded', () => {
		const overlay = document.getElementById('loading-overlay');
		if (overlay) overlay.classList.add('hidden');
	});
}

// Toast notifications
function showToast(message, type = 'success') {
	const container = $('toast-container');
	const toast = document.createElement('div');
	toast.className = `toast ${type}`;
	toast.textContent = message;
	container.appendChild(toast);
	
	setTimeout(() => {
		toast.style.opacity = '0';
		toast.style.transform = 'translateX(100%)';
		setTimeout(() => container.removeChild(toast), 300);
	}, 3000);
}

// Search functionality
function setupSearch() {
	const searchInput = $('ingredient-search');
	const suggestions = $('search-suggestions');
	const clearBtn = $('search-clear');

	let activeIndex = -1;
	let currentMatches = [];
	let debounceTimer = null;

	function highlight(text, query) {
		const idx = text.toLowerCase().indexOf(query.toLowerCase());
		if (idx === -1) return text;
		const before = text.slice(0, idx);
		const match = text.slice(idx, idx + query.length);
		const after = text.slice(idx + query.length);
		return `${before}<mark>${match}</mark>${after}`;
	}

	function renderSuggestions(query) {
		if (!query) {
			suggestions.style.display = 'none';
			suggestions.innerHTML = '';
			activeIndex = -1;
			currentMatches = [];
			return;
		}

		currentMatches = DEFAULT_INGREDIENTS.filter(ing =>
			ing.toLowerCase().includes(query.toLowerCase()) && !selectedIngredients.has(ing)
		).slice(0, 8);
		console.log('[search] query:', query, 'matches:', currentMatches);

		if (currentMatches.length === 0) {
			suggestions.style.display = 'none';
			suggestions.innerHTML = '';
			activeIndex = -1;
			return;
		}

		suggestions.innerHTML = currentMatches.map((ing, i) =>
			`<div class="search-suggestion${i === activeIndex ? ' active' : ''}" data-ingredient="${ing}">` +
			`${highlight(ing, query)}` +
			`</div>`
		).join('');
		suggestions.style.display = 'block';
	}

	function debouncedRender(query) {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => renderSuggestions(query), 150);
	}

	function addActive(delta) {
		if (currentMatches.length === 0) return;
		activeIndex = (activeIndex + delta + currentMatches.length) % currentMatches.length;
		renderSuggestions(searchInput.value.trim());
	}

	searchInput.addEventListener('input', (e) => {
		const query = e.target.value.trim();
		debouncedRender(query);
		if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';
	});

	searchInput.addEventListener('keydown', (e) => {
		const query = searchInput.value.trim();
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			addActive(1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			addActive(-1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (activeIndex >= 0 && currentMatches[activeIndex]) {
				addIngredient(currentMatches[activeIndex]);
			} else if (query.length >= 1) {
				addIngredient(query.toLowerCase());
			}
			searchInput.value = '';
			suggestions.style.display = 'none';
			suggestions.innerHTML = '';
			activeIndex = -1;
			currentMatches = [];
			if (clearBtn) clearBtn.style.display = 'none';
		} else if (e.key === 'Escape') {
			suggestions.style.display = 'none';
			suggestions.innerHTML = '';
			activeIndex = -1;
		}
	});

	suggestions.addEventListener('click', (e) => {
		const suggestion = e.target.closest('.search-suggestion');
		if (suggestion) {
			const ingredient = suggestion.dataset.ingredient;
			addIngredient(ingredient);
			searchInput.value = '';
			suggestions.style.display = 'none';
			suggestions.innerHTML = '';
			activeIndex = -1;
			currentMatches = [];
			if (clearBtn) clearBtn.style.display = 'none';
		}
	});

	// Hide suggestions when clicking outside
	document.addEventListener('click', (e) => {
		if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
			suggestions.style.display = 'none';
		}
	});

	if (clearBtn) {
		clearBtn.addEventListener('click', () => {
			searchInput.value = '';
			suggestions.style.display = 'none';
			suggestions.innerHTML = '';
			activeIndex = -1;
			currentMatches = [];
			clearBtn.style.display = 'none';
			searchInput.focus();
		});
	}
}

// Ingredient management
function addIngredient(ingredient) {
	if (!selectedIngredients.has(ingredient)) {
		selectedIngredients.add(ingredient);
		updateSelectedChips();
		showToast(`Added ${ingredient}`);
	}
}

function removeIngredient(ingredient) {
	selectedIngredients.delete(ingredient);
	updateSelectedChips();
	showToast(`Removed ${ingredient}`);
}

function updateSelectedChips() {
	const chipsContainer = $('selected-chips');
	chipsContainer.innerHTML = '';
	
	selectedIngredients.forEach(ingredient => {
		const chip = document.createElement('div');
		chip.className = 'ingredient-chip';
		chip.innerHTML = `
			<span>${ingredient}</span>
			<button class="remove" onclick="removeIngredient('${ingredient}')">×</button>
		`;
		chipsContainer.appendChild(chip);
	});
}

// Modal ingredient list functionality removed

// Preset combinations
function setupPresets() {
	document.querySelectorAll('.preset-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const ingredients = btn.dataset.ingredients.split(',');
			ingredients.forEach(ing => addIngredient(ing.trim()));
			showToast(`Added ${ingredients.length} ingredients from ${btn.textContent}`);
		});
	});
}

// Recipe management
function toggleFavorite(recipe) {
	const index = favorites.findIndex(fav => fav.name === recipe.name);
	let added = false;
	if (index > -1) {
		favorites.splice(index, 1);
		showToast('Removed from favorites');
		added = false;
	} else {
		favorites.push(recipe);
		showToast('Added to favorites');
		added = true;
	}
	localStorage.setItem('recipeFavorites', JSON.stringify(favorites));
	updateFavoriteButton();
	return added;
}

function updateFavoriteButton() {
	const btn = $('favorites-btn');
	btn.textContent = `Favorites (${favorites.length})`;
}

function showFavorites() {
	if (favorites.length === 0) {
		showToast('No favorites yet', 'error');
		return;
	}
	currentRecipes = [...favorites]; // Create a copy
	renderRecipes(currentRecipes);
	showToast(`Showing ${favorites.length} favorite recipes`);
	
	// Update the results header to show we're in favorites mode
	const resultsHeader = document.querySelector('.results-header h2');
	if (resultsHeader) {
		resultsHeader.textContent = `⭐ Favorite Recipes (${favorites.length})`;
	}
	
	// Add back button
	const resultsControls = document.querySelector('.results-controls');
	if (resultsControls && !document.getElementById('back-to-generated')) {
		const backBtn = document.createElement('button');
		backBtn.id = 'back-to-generated';
		backBtn.className = 'btn secondary';
		backBtn.textContent = '← Back to Generated';
		backBtn.addEventListener('click', backToGenerated);
		resultsControls.insertBefore(backBtn, resultsControls.firstChild);
	}
}

function backToGenerated() {
	// Restore the last generated recipes if they exist
	if (lastGeneratedRecipes.length > 0) {
		currentRecipes = [...lastGeneratedRecipes];
		renderRecipes(currentRecipes);
		showToast('Back to generated recipes');
	} else {
		// No generated recipes to go back to, show empty state
		const resultsEl = $("results");
		resultsEl.innerHTML = '<p class="muted">Generate some recipes first to see them here.</p>';
		showToast('No generated recipes to return to');
	}
	
	// Reset header
	const resultsHeader = document.querySelector('.results-header h2');
	if (resultsHeader) {
		resultsHeader.textContent = '🍽️ Suggested Recipes';
	}
	
	// Remove back button
	const backBtn = document.getElementById('back-to-generated');
	if (backBtn) {
		backBtn.remove();
	}
}

function expandAllRecipes() {
	const bodies = document.querySelectorAll('.recipe-body');
	const chevrons = document.querySelectorAll('.chevron');
	const allClosed = Array.from(bodies).every(body => !body.classList.contains('open'));
	
	bodies.forEach(body => {
		body.classList.toggle('open', allClosed);
	});
	chevrons.forEach(chev => {
		chev.classList.toggle('open', allClosed);
	});
	
	const expandBtn = document.getElementById('expand-all');
	if (expandBtn) {
		expandBtn.textContent = allClosed ? 'Collapse All' : 'Expand All';
	}
}

// Get appropriate icon and category for recipe type
function getRecipeIcon(recipeName) {
	const name = recipeName.toLowerCase();
	
	if (name.includes('soup') || name.includes('stew')) return '🍲';
	if (name.includes('salad')) return '🥗';
	if (name.includes('pasta') || name.includes('noodle')) return '🍝';
	if (name.includes('pizza')) return '🍕';
	if (name.includes('burger') || name.includes('sandwich')) return '🍔';
	if (name.includes('rice')) return '🍚';
	if (name.includes('chicken')) return '🍗';
	if (name.includes('beef') || name.includes('steak')) return '🥩';
	if (name.includes('fish') || name.includes('salmon') || name.includes('tuna')) return '🐟';
	if (name.includes('cake') || name.includes('dessert') || name.includes('sweet')) return '🍰';
	if (name.includes('bread') || name.includes('toast')) return '🍞';
	if (name.includes('smoothie') || name.includes('juice')) return '🥤';
	if (name.includes('casserole') || name.includes('bake')) return '🥘';
	if (name.includes('stir') || name.includes('fry')) return '🍳';
	if (name.includes('curry')) return '🍛';
	if (name.includes('taco') || name.includes('burrito')) return '🌮';
	if (name.includes('pancake') || name.includes('waffle')) return '🥞';
	if (name.includes('egg')) return '🍳';
	if (name.includes('cheese')) return '🧀';
	if (name.includes('pasta')) return '🍝';
	
	// Default food icon
	return '🍽️';
}

// Get category and color for recipe
function getRecipeCategory(recipeName) {
	const name = recipeName.toLowerCase();
	
	if (name.includes('soup') || name.includes('stew')) return { name: 'Soups', color: '#dc2626', bg: '#fef2f2', text: '#991b1b' };
	if (name.includes('salad')) return { name: 'Salads', color: '#059669', bg: '#f0fdf4', text: '#047857' };
	if (name.includes('pasta') || name.includes('noodle')) return { name: 'Pasta', color: '#2563eb', bg: '#eff6ff', text: '#1d4ed8' };
	if (name.includes('pizza')) return { name: 'Pizza', color: '#7c3aed', bg: '#faf5ff', text: '#6d28d9' };
	if (name.includes('burger') || name.includes('sandwich')) return { name: 'Fast Food', color: '#ea580c', bg: '#fff7ed', text: '#c2410c' };
	if (name.includes('rice')) return { name: 'Rice', color: '#0891b2', bg: '#f0f9ff', text: '#0e7490' };
	if (name.includes('chicken')) return { name: 'Poultry', color: '#16a34a', bg: '#f0fdf4', text: '#15803d' };
	if (name.includes('beef') || name.includes('steak')) return { name: 'Meat', color: '#b45309', bg: '#fffbeb', text: '#92400e' };
	if (name.includes('fish') || name.includes('salmon') || name.includes('tuna')) return { name: 'Seafood', color: '#0284c7', bg: '#f0f9ff', text: '#0369a1' };
	if (name.includes('cake') || name.includes('dessert') || name.includes('sweet')) return { name: 'Desserts', color: '#be185d', bg: '#fdf2f8', text: '#9d174d' };
	if (name.includes('bread') || name.includes('toast')) return { name: 'Bakery', color: '#a16207', bg: '#fffbeb', text: '#854d0e' };
	if (name.includes('smoothie') || name.includes('juice')) return { name: 'Beverages', color: '#0d9488', bg: '#f0fdfa', text: '#0f766e' };
	if (name.includes('casserole') || name.includes('bake')) return { name: 'Baked', color: '#ca8a04', bg: '#fffbeb', text: '#a16207' };
	if (name.includes('stir') || name.includes('fry')) return { name: 'Stir-fry', color: '#dc2626', bg: '#fef2f2', text: '#991b1b' };
	if (name.includes('curry')) return { name: 'Curry', color: '#d97706', bg: '#fffbeb', text: '#b45309' };
	if (name.includes('taco') || name.includes('burrito')) return { name: 'Mexican', color: '#16a34a', bg: '#f0fdf4', text: '#15803d' };
	if (name.includes('pancake') || name.includes('waffle')) return { name: 'Breakfast', color: '#ea580c', bg: '#fff7ed', text: '#c2410c' };
	if (name.includes('egg')) return { name: 'Eggs', color: '#ca8a04', bg: '#fffbeb', text: '#a16207' };
	if (name.includes('cheese')) return { name: 'Dairy', color: '#6b7280', bg: '#f9fafb', text: '#4b5563' };
	
	// Default category
	return { name: 'General', color: '#6b7280', bg: '#f9fafb', text: '#4b5563' };
}



// API call
async function handleGenerate() {
	console.log("Generate button clicked");
	const errorEl = $("error");
	const resultsEl = $("results");
	const overlay = $("loading-overlay");
	
	errorEl.classList.add("hidden");
	resultsEl.innerHTML = "";
	overlay.classList.remove("hidden");

	try {
		const ingredients = Array.from(selectedIngredients);
		console.log("Selected ingredients:", ingredients);
		if (!ingredients.length) {
			throw new Error("Please select ingredients first.");
		}

		const res = await fetch("/generate_recipes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ingredients }),
		});
		const data = await res.json();
		if (!res.ok) {
			throw new Error(data.error || "Failed to generate recipes");
		}

		currentRecipes = data.recipes || [];
		lastGeneratedRecipes = [...currentRecipes]; // Store a copy
		renderRecipes(currentRecipes);
		showToast(`Generated ${currentRecipes.length} recipes`);
		
		// Reset results header to default
		const resultsHeader = document.querySelector('.results-header h2');
		if (resultsHeader) {
			resultsHeader.textContent = '🍽️ Suggested Recipes';
		}
		
		// Remove back button if it exists
		const backBtn = document.getElementById('back-to-generated');
		if (backBtn) {
			backBtn.remove();
		}
	} catch (err) {
		errorEl.textContent = err.message || String(err);
		errorEl.classList.remove("hidden");
		showToast(err.message, 'error');
	} finally {
		overlay.classList.add("hidden");
	}
}

function renderRecipes(recipes) {
	const resultsEl = $("results");
	if (!recipes.length) {
		resultsEl.innerHTML = '<p class="muted">No recipes found.</p>';
		return;
	}

	resultsEl.innerHTML = '';
	recipes.forEach((r, idx) => {
		const isFavorite = favorites.some(fav => fav.name === r.name);
		const card = document.createElement("div");
		card.className = "recipe";
		// Check if user has uploaded a photo for this recipe
		const userPhotos = JSON.parse(localStorage.getItem('userPhotos') || '{}');
		const userPhoto = userPhotos[r.name];
		
		const category = getRecipeCategory(r.name);
		const icon = getRecipeIcon(r.name);
		
		card.innerHTML = `
			<div class="recipe-header colorful-card" data-idx="${idx}" style="background: ${category.bg}; border-left: 4px solid ${category.color};">
				<div class="recipe-category-badge" style="background: ${category.color}; color: white;">
					${category.name}
				</div>
				<div class="recipe-icon-container" style="background: linear-gradient(135deg, ${category.color}, ${category.color}dd);">
					<div class="recipe-icon">
						${icon}
					</div>
				</div>
				<div class="recipe-content">
					<div class="recipe-meta">
						<span class="recipe-time" style="color: ${category.text};">⏱️ ${Math.floor(Math.random() * 20) + 20} min</span>
						<span class="recipe-difficulty" style="color: ${category.text};">👨‍🍳 ${['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]}</span>
						<span class="recipe-servings" style="color: ${category.text};">👥 ${Math.floor(Math.random() * 3) + 2} servings</span>
					</div>
					<h3 class="recipe-title" style="color: ${category.text};">${r.name}</h3>
					<p class="recipe-desc" style="color: var(--text-muted);">${r.shortDescription || ""}</p>
					<div class="recipe-tags">
						<span class="tag" style="background: ${category.color}15; color: ${category.text}; border: 1px solid ${category.color}30;">${category.name}</span>
						<span class="tag" style="background: ${category.color}15; color: ${category.text}; border: 1px solid ${category.color}30;">${r.name.toLowerCase().includes('pasta') ? 'Italian' : 'International'}</span>
					</div>
				</div>
				<div class="recipe-actions">
					<button class="favorite-btn" data-action="favorite" data-recipe='${JSON.stringify(r).replace(/"/g, '&quot;')}' style="color: ${category.color};">
						${isFavorite ? '★' : '☆'}
					</button>
					<span class="chevron" style="color: ${category.color};">▶</span>
				</div>
			</div>
			<div class="recipe-body" id="recipe-body-${idx}">
				<div class="recipe-ingredients">
					<h4>Ingredients</h4>
					<ul class="ingredients-list">
						${(r.ingredients || []).map(ingredient => `<li>${ingredient}</li>`).join("")}
					</ul>
				</div>
				<div class="recipe-instructions">
					<h4>Instructions</h4>
					<ol class="steps">
						${(r.steps || []).map(s => `<li>${s.replace(/^\d+\.\d+\.\s*/, '').replace(/^\d+\.\s*/, '')}</li>`).join("")}
					</ol>
				</div>
			</div>
		`;
		resultsEl.appendChild(card);
		

		
		console.log(`Rendered recipe ${idx}: ${r.name}`);
	});

	// Remove any existing event listeners by cloning the element
	const newResultsEl = resultsEl.cloneNode(true);
	resultsEl.parentNode.replaceChild(newResultsEl, resultsEl);
	
	// Scroll button updates removed for vertical layout
	
	// Re-attach click handlers for expand/collapse and favorite
	newResultsEl.addEventListener("click", (e) => {
		// Handle favorite button
		if (e.target.classList.contains('favorite-btn')) {
			const recipeData = e.target.dataset.recipe;
			if (recipeData) {
				const recipe = JSON.parse(recipeData.replace(/&quot;/g, '"'));
				const added = toggleFavorite(recipe);
				// Reflect UI state immediately
				e.target.textContent = added ? '★' : '☆';
				e.target.setAttribute('aria-pressed', String(added));
			}
			return;
		}
		
		// Handle recipe header click for expand/collapse
		
		const header = e.target.closest('.recipe-header');
		if (!header) return;
		
		const idx = header.getAttribute('data-idx');
		const body = document.getElementById(`recipe-body-${idx}`);
		const chev = header.querySelector('.chevron');
		
		if (body && chev) {
			const isOpen = body.classList.contains('open');
			body.classList.toggle('open');
			chev.classList.toggle('open', !isOpen);
			console.log(`Toggled recipe ${idx}, open: ${!isOpen}`);
		}
	});
}

// Horizontal scroll functionality removed for vertical layout

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
	try {
		console.log("App initializing...");
		// Ensure loading overlay is hidden on page load
		$("loading-overlay").classList.add("hidden");
		
		updateSelectedChips();
		setupSearch();
		setupPresets();
		updateFavoriteButton();
		
		$("generate-btn").addEventListener("click", handleGenerate);
		$("favorites-btn").addEventListener("click", showFavorites);
		$("expand-all").addEventListener("click", expandAllRecipes);
		
		// Scroll functionality removed for vertical layout
		
		console.log("App initialized successfully");
	} catch (error) {
		console.error("Error initializing app:", error);
		showToast("Error initializing app: " + error.message, 'error');
	}
});


