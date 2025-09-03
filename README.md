# Recipe Generator (Flask + Gemini)

A minimal full-stack app to generate recipes from selected or uploaded pantry ingredients.

## Setup

1) Create and activate a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2) Install dependencies

```bash
pip install -r requirements.txt
```

3) Set your Google Gemini API key

```bash
export GOOGLE_API_KEY="YOUR_API_KEY"
```

4) Run the app

```bash
python app.py
```

Open `http://localhost:5000`.

## Notes
- If the Gemini API key is missing or the response is not parseable, the backend returns three fallback recipes so the UI remains usable.
- Upload `.txt` (newline-separated) or `.csv` files; both are parsed into ingredient names.
- Stock images are Unsplash featured queries using the dish name.

## Project Structure
- `app.py`: Flask server and `/generate_recipes` endpoint
- `templates/index.html`: UI markup
- `static/style.css`: Styling
- `static/app.js`: Client logic (file parsing, submit, rendering)
