import yfinance as yf
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.models import Company, StockPrice
from sklearn.linear_model import LinearRegression

DEFAULT_SYMBOLS = ["INFY.NS", "TCS.NS", "RELIANCE.NS", "HDFCBANK.NS", "TATAMOTORS.NS", "WIPRO.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS"]

def initialize_data(db: Session):
    for symbol in DEFAULT_SYMBOLS:
        existing = db.query(Company).filter(Company.symbol == symbol).first()
        if not existing:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            name = info.get("shortName", symbol)
            sector = info.get("sector", "Technology")
            company = Company(symbol=symbol, name=name, sector=sector)
            db.add(company)
            
            # Fetch 1 year of data
            hist = ticker.history(period="1y")
            hist = hist.reset_index()
            # Handle timezone naive datetime
            hist['Date'] = pd.to_datetime(hist['Date']).dt.date
            
            for _, row in hist.iterrows():
                if pd.isna(row['Open']) or pd.isna(row['Close']):
                    continue
                price = StockPrice(
                    symbol=symbol,
                    date=row['Date'],
                    open=row['Open'],
                    high=row['High'],
                    low=row['Low'],
                    close=row['Close'],
                    volume=row.get('Volume', 0)
                )
                db.add(price)
            db.commit()

def fetch_stock_data_from_db(db: Session, symbol: str, days: int = 30):
    cutoff_date = (datetime.now() - timedelta(days=days)).date()
    # Always fetch a bit more for moving average calculations
    fetch_cutoff = (datetime.now() - timedelta(days=days + 15)).date()
    
    records = db.query(StockPrice).filter(
        StockPrice.symbol == symbol,
        StockPrice.date >= fetch_cutoff
    ).order_by(StockPrice.date).all()
    
    if not records:
        # Fallback to yfinance if not in DB
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="3mo")
        hist = hist.reset_index()
        hist['Date'] = pd.to_datetime(hist['Date']).dt.date
        df = hist
    else:
        df = pd.DataFrame([{
            'Date': r.date,
            'Open': r.open,
            'High': r.high,
            'Low': r.low,
            'Close': r.close,
            'Volume': r.volume
        } for r in records])
    
    if df.empty:
        return pd.DataFrame()

    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values(by="Date").reset_index(drop=True)
    
    # Calculate fields
    df['daily_return'] = (df['Close'] - df['Open']) / df['Open']
    df['ma_7'] = df['Close'].rolling(window=7).mean()
    
    # Filter back to exactly requested days
    cutoff_datetime = pd.to_datetime(cutoff_date)
    df = df[df['Date'] >= cutoff_datetime]
    
    # Handle NaNs
    df = df.fillna(0)
    
    return df

def get_stock_summary(db: Session, symbol: str):
    # Get 1 year data for 52-week high/low
    records = db.query(StockPrice).filter(StockPrice.symbol == symbol).all()
    
    if len(records) == 0:
        return None
        
    df = pd.DataFrame([{
        'Date': r.date,
        'Close': r.close,
        'High': r.high,
        'Low': r.low,
        'Open': r.open
    } for r in records])
    
    high_52week = df['High'].max()
    low_52week = df['Low'].min()
    
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values(by="Date")
    last_30d = df.tail(30).copy()
    
    avg_close_30d = last_30d['Close'].mean()
    
    # Volatility (std of daily returns)
    last_30d['daily_return'] = (last_30d['Close'] - last_30d['Open']) / last_30d['Open']
    volatility_30d = last_30d['daily_return'].std() * np.sqrt(252) # Annualized
    
    # ML Prediction: Linear Regression for next price based on last 14 days
    if len(last_30d) >= 14:
        X = np.arange(len(last_30d)).reshape(-1, 1)
        y = last_30d['Close'].values
        model = LinearRegression()
        model.fit(X, y)
        predicted_next_close = model.predict(np.array([[len(last_30d)]]))[0]
    else:
        predicted_next_close = None
        
    return {
        "symbol": symbol,
        "high_52week": high_52week,
        "low_52week": low_52week,
        "avg_close_30d": avg_close_30d,
        "volatility_30d": volatility_30d,
        "predicted_next_close": predicted_next_close
    }
