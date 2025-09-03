A modern, AI-powered recipe generator that creates personalized recipes from your available ingredients. Built with Flask and powered by Google's Gemini AI, this application transforms your pantry into endless culinary possibilities.

## ✨ Features

- 🤖 **AI-Powered Recipe Generation** - Uses Google Gemini AI to create unique, personalized recipes
- 🔍 **Smart Ingredient Search** - Autocomplete search with 100+ common ingredients
- ⚡ **Quick Preset Combinations** - Pre-configured ingredient sets for popular dishes
- 💾 **Favorites System** - Save and manage your favorite recipes locally
- 📱 **Responsive Design** - Beautiful, mobile-friendly interface with dark theme
- 🎨 **Modern UI/UX** - Glassmorphism design with smooth animations
- 🔄 **Fallback System** - Graceful degradation when AI is unavailable
- 🌐 **CORS Enabled** - Ready for cross-origin requests

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Google Gemini API key ([Get one here](https://ai.google.dev))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/recipe-generator.git
   cd recipe-generator
   ```

2. **Create and activate virtual environment**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file
   echo "GOOGLE_API_KEY=your_api_key_here" > .env
   
   # Or export directly
   export GOOGLE_API_KEY="your_api_key_here"
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 🏗️ Project Structure

```
recipe-generator/
├── app.py                 # Flask application and API endpoints
├── requirements.txt       # Python dependencies
├── README.md             # Project documentation
├── .gitignore            # Git ignore rules
├── .env                  # Environment variables (create this)
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── style.css         # CSS styling and animations
    └── app.js            # Frontend JavaScript logic
```

## 🔧 API Documentation

### Endpoints

#### `POST /generate_recipes`

Generates AI-powered recipes based on provided ingredients.

**Request Body:**
```json
{
  "ingredients": ["chicken", "rice", "onion", "garlic"]
}
```

**Response:**
```json
{
  "recipes": [
    {
      "name": "Chicken Fried Rice",
      "shortDescription": "Quick and flavorful fried rice with tender chicken",
      "ingredients": [
        "2 cups cooked rice",
        "1 lb chicken breast, diced",
        "1 onion, chopped",
        "3 cloves garlic, minced",
        "2 tbsp soy sauce",
        "2 tbsp vegetable oil"
      ],
      "steps": [
        "Heat oil in a large skillet over medium-high heat",
        "Add diced chicken and cook until golden brown",
        "Add onion and garlic, sauté until fragrant",
        "Add rice and soy sauce, stir-fry for 3-4 minutes",
        "Serve hot with optional garnishes"
      ],
      "stockImageUrl": "https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Chicken+Fried+Rice"
    }
  ]
}
```

## 🎨 Features in Detail

### Smart Ingredient Search
- **Autocomplete**: Type-ahead search with 100+ common ingredients
- **Categories**: Fruits, vegetables, proteins, grains, dairy, herbs & spices
- **Validation**: Input sanitization and duplicate prevention

### AI Recipe Generation
- **Gemini Integration**: Uses Google's latest Gemini 1.5 Flash model
- **Diverse Output**: Generates 3 unique recipes per request
- **Fallback System**: Provides mock recipes when AI is unavailable
- **Input Limits**: Maximum 20 ingredients per request

### User Experience
- **Favorites**: Save recipes to local storage
- **Responsive**: Works on desktop, tablet, and mobile
- **Dark Theme**: Modern glassmorphism design
- **Animations**: Smooth transitions and hover effects

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Your Google Gemini API key | Yes |
| `PORT` | Server port (default: 5000) | No |

### Customization

You can customize the application by modifying:

- **Ingredients List**: Edit `DEFAULT_INGREDIENTS` in `static/app.js`
- **Styling**: Modify CSS variables in `static/style.css`
- **AI Prompt**: Update the prompt template in `app.py`
- **Fallback Recipes**: Customize mock recipes in `_fallback_recipes()`

## 🔒 Security Considerations

- **API Key**: Store your Gemini API key in environment variables
- **Input Validation**: All user inputs are sanitized and validated
- **Rate Limiting**: Consider implementing rate limiting for production use
- **CORS**: Configure CORS settings for your deployment environment

## 🚀 Deployment

### Local Development
```bash
python app.py
```
