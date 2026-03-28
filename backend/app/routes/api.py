from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import numpy as np
import pandas as pd

from app.database.database import get_db
from app.models.models import Company, StockPrice
from app.models.schemas import Company as CompanySchema, StockData, StockSummary, CompareResult
from app.services.stock_service import fetch_stock_data_from_db, get_stock_summary

router = APIRouter()

@router.get("/companies", response_model=List[CompanySchema])
async def list_companies(db: Session = Depends(get_db)):
    companies = db.query(Company).all()
    if not companies:
        raise HTTPException(status_code=404, detail="No companies found")
    return companies

@router.get("/data/{symbol}")
async def get_stock_data(symbol: str, days: int = Query(30, ge=1, le=365), db: Session = Depends(get_db)):
    df = fetch_stock_data_from_db(db, symbol.upper(), days=days)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"Data not found for symbol {symbol}")
    
    # Converting DataFrame to list of dicts for JSON
    df.columns = [c.lower() for c in df.columns]
    data = df.to_dict(orient="records")
    return {"symbol": symbol.upper(), "data": data}

@router.get("/summary/{symbol}", response_model=StockSummary)
async def get_summary(symbol: str, db: Session = Depends(get_db)):
    summary = get_stock_summary(db, symbol.upper())
    if not summary:
        raise HTTPException(status_code=404, detail=f"Summary not found for symbol {symbol}")
    return summary

@router.get("/compare", response_model=Dict[str, Any])
async def compare_stocks(symbol1: str = Query(..., min_length=1), symbol2: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    df1 = fetch_stock_data_from_db(db, symbol1.upper(), days=90)
    df2 = fetch_stock_data_from_db(db, symbol2.upper(), days=90)
    
    if df1.empty or df2.empty:
        raise HTTPException(status_code=404, detail="One or both symbols not found")
        
    s1_returns = df1['daily_return'].values
    s2_returns = df2['daily_return'].values
    
    # Trim to same length
    min_len = min(len(s1_returns), len(s2_returns))
    s1_returns = s1_returns[-min_len:]
    s2_returns = s2_returns[-min_len:]
    
    # Correlation
    correlation = 0.0
    if min_len > 1:
        correlation = np.corrcoef(s1_returns, s2_returns)[0, 1]
        
    return {
        "symbol1": symbol1.upper(),
        "symbol2": symbol2.upper(),
        "correlation": correlation,
        "symbol1_summary": get_stock_summary(db, symbol1.upper()),
        "symbol2_summary": get_stock_summary(db, symbol2.upper())
    }
