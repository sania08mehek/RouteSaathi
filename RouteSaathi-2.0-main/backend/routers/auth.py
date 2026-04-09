"""
Authentication Router - Login and User Management
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from services.data_utils import read_json, find_by_key

router = APIRouter()

# Mock users data
USERS = [
    {"id": "U001", "name": "Admin Controller", "email": "admin@bmtc.gov.in", "password": "admin123", "role": "coordinator"},
    {"id": "U002", "name": "Ganesh Rao", "email": "ganesh@bmtc.gov.in", "password": "conductor123", "role": "conductor", "bus_id": "KA-01-F-1234", "route_id": "R-276"},
    {"id": "U003", "name": "Ramesh Kumar", "email": "ramesh@bmtc.gov.in", "password": "conductor123", "role": "conductor", "bus_id": "KA-22-W-7547", "route_id": "R-KBS-1"},
    {"id": "U004", "name": "Suresh Reddy", "email": "suresh@bmtc.gov.in", "password": "conductor123", "role": "conductor", "bus_id": "KA-03-W-1087", "route_id": "R-201"},
    {"id": "U005", "name": "Prakash M", "email": "prakash@bmtc.gov.in", "password": "conductor123", "role": "conductor", "bus_id": "KA-01-F-3421", "route_id": "G-10"},
    {"id": "U006", "name": "Anil S", "email": "anil@bmtc.gov.in", "password": "conductor123", "role": "conductor", "bus_id": "KA-01-F-5678", "route_id": "R-500D"},
    {"id": "U007", "name": "Venkatesh", "email": "venkatesh@bmtc.gov.in", "password": "conductor123", "role": "conductor", "bus_id": "KA-01-F-7890", "route_id": "R-365C"},
    {"id": "U008", "name": "Passenger User", "email": "user@gmail.com", "password": "user123", "role": "commuter"},
]

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    user: Optional[dict] = None
    message: str

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Authenticate user and return user details with role"""
    for user in USERS:
        if user["email"] == credentials.email and user["password"] == credentials.password:
            # Don't return password in response
            user_data = {k: v for k, v in user.items() if k != "password"}
            return LoginResponse(
                success=True,
                user=user_data,
                message="Login successful"
            )
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password"
    )

@router.get("/users")
async def get_all_users():
    """Get all users (for admin purposes)"""
    return [{"id": u["id"], "name": u["name"], "role": u["role"], "email": u["email"]} for u in USERS]

@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user by ID"""
    for user in USERS:
        if user["id"] == user_id:
            return {k: v for k, v in user.items() if k != "password"}
    raise HTTPException(status_code=404, detail="User not found")

@router.get("/conductors")
async def get_conductors():
    """Get all conductors for the communication panel"""
    conductors = []
    for user in USERS:
        if user["role"] == "conductor":
            conductors.append({
                "id": user["id"],
                "name": user["name"],
                "bus_id": user.get("bus_id", ""),
                "route_id": user.get("route_id", ""),
                "status": "online",  # Mock status
                "last_active": "Now"
            })
    return conductors
