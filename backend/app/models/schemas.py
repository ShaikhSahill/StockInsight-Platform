from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class CompanyBase(BaseModel):
    symbol: str
    name: str
    sector: Optional[str] = None

class Company(CompanyBase):
    class Config:
        orm_mode = True

class StockData(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int
    daily_return: Optional[float] = None
    ma_7: Optional[float] = None

class StockSummary(BaseModel):
    symbol: str
    high_52week: float
    low_52week: float
    avg_close_30d: float
    volatility_30d: float
    predicted_next_close: Optional[float] = None

class CompareResult(BaseModel):
    symbol: str
    average_close: float
    volatility: float
    correlation: Optional[float] = None
