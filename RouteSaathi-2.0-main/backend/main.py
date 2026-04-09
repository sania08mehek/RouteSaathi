"""
RouteSaathi 2.0 - FastAPI Backend
BMTC Bus Fleet Management System with AI-powered Route Optimization
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routers import auth, buses, routes, tickets, notifications, ai_engine, conductors

app = FastAPI(
    title="RouteSaathi API",
    description="AI-driven bus fleet management system for BMTC",
    version="2.0.0"
)

# CORS Configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(buses.router, prefix="/api/buses", tags=["Buses"])
app.include_router(routes.router, prefix="/api/routes", tags=["Routes"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["Tickets"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(ai_engine.router, prefix="/api/ai", tags=["AI Engine"])
app.include_router(conductors.router, prefix="/api/conductors", tags=["Conductors"])

@app.get("/")
async def root():
    return {
        "message": "RouteSaathi API v2.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "RouteSaathi Backend"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
