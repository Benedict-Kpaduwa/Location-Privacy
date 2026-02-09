"""
Location Privacy Teaching System - FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

app = FastAPI(
    title="Location Privacy Teaching System API",
    description="API for demonstrating location data re-identification risks and privacy protection techniques",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Location Privacy Teaching System API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
