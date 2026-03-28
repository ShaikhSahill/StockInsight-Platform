from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base
from app.routes.api import router
import threading
import time

# Create db tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Financial Data Platform API",
    description="Real-time and historic stock data with analysis.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to Financial Data Platform API. Visit /docs for Swagger UI."}

# We can initialize seed data in background
@app.on_event("startup")
def startup_event():
    # Import locally to avoid circular dependencies
    from app.database.database import SessionLocal
    from app.services.stock_service import initialize_data
    
    def seed_data():
        db = SessionLocal()
        try:
            # Check if an Indian stock exists
            from app.models.models import Company
            if db.query(Company).filter(Company.symbol == "INFY.NS").first() is None:
                # Need to run YFinance fetches, take some time
                print("Seeding database... this might take a minute.")
                initialize_data(db)
                print("Database seeded successfully.")
        except Exception as e:
            print(f"Error seeding db: {e}")
        finally:
            db.close()
            
    thread = threading.Thread(target=seed_data)
    thread.start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
