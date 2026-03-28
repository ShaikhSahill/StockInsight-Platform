# Financial Data Platform (Stock Market Dashboard)

A full-stack modern financial data dashboard built with React (Vite) and FastAPI. This project demonstrates clean UI/UX and analytical capabilities on stock data.

## Features
- **Real-time & Historical Data**: Uses `yfinance` to fetch real stock data. Falls back to mock data or last fetched if API fails.
- **Data Processing**: Pandas used for calculating moving averages (`7-day MA`), daily returns, volatility, and predicting trends.
- **Custom Metric**: Volatility Score & Basic AI Prediction modeling.
- **Modern UI**: Fintech-styled glassmorphic dark mode dashboard.
- **Charts**: Interactive area charts using Recharts.

## Folder Structure
- `backend/` : FastAPI, SQLite, Pandas, Scikit-Learn
- `frontend/` : React (Vite), Framer-Motion, Recharts, Axios

## Prerequisites
- Node.js (v18+)
- Python 3.9+
- Pip / npm

## Setup & Running

### 1. Backend Setup
Navigate into the `backend` directory:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or source venv/bin/activate # Mac/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload
```
*Note: The first launch will take ~30-60 seconds to download real market data and seed the SQLite database.* The backend will be live at `http://localhost:8000`. You can visit `http://localhost:8000/docs` to see Swagger UI API Documentation.

### 2. Frontend Setup
Navigate into the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```

Visit the displayed local URL (usually `http://localhost:5173`) to view the application!

## Architecture Highlights
- RESTful APIs
- Asynchronous routes in FastAPI
- SQL ORM (SQLAlchemy)
- Component-based, responsive Frontend styling with pure CSS variables

## Bonus Features Implemented
- 📈 Simple ML prediction (Linear Regression for next price prediction)
- 🎨 Smooth animations (Framer Motion)
```
