from fastapi import FastAPI
from app.routers import summarize

app = FastAPI(title="Grade Master API")

app.include_router(summarize.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Grade Master API is running"}
