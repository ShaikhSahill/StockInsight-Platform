from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.database.database import Base

class Company(Base):
    __tablename__ = "companies"

    symbol = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    sector = Column(String, nullable=True)

class StockPrice(Base):
    __tablename__ = "stock_prices"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, ForeignKey("companies.symbol"))
    date = Column(Date, index=True)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Integer)
