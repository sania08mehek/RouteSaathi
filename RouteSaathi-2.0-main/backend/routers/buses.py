"""
Buses Router - Bus Management Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from services.data_utils import read_json, write_json, find_by_key, update_item_in_json
import random

router = APIRouter()

class BusStatusUpdate(BaseModel):
    status: str  # MOVING, IDLE, STUCK, BREAKDOWN

class BusLocationUpdate(BaseModel):
    lat: float
    lng: float
    speed: Optional[str] = None

class BusOccupancyUpdate(BaseModel):
    occupancy_percent: int

@router.get("/")
async def get_all_buses():
    """Get all buses with live positions and status"""
    buses = read_json("buses.json")
    return buses

@router.get("/stats")
async def get_bus_stats():
    """Get fleet statistics for dashboard"""
    buses = read_json("buses.json")
    
    total = len(buses)
    active = len([b for b in buses if b.get("status") == "MOVING"])
    idle = len([b for b in buses if b.get("status") == "IDLE"])
    stuck = len([b for b in buses if b.get("status") == "STUCK"])
    
    # Calculate average occupancy
    avg_occupancy = sum(b.get("occupancy_percent", 0) for b in buses) / total if total > 0 else 0
    
    # Count high occupancy buses (>80%)
    high_occupancy = len([b for b in buses if b.get("occupancy_percent", 0) > 80])
    
    return {
        "total_active_buses": active,
        "total_buses": total,
        "idle_buses": idle,
        "stuck_buses": stuck,
        "average_occupancy": round(avg_occupancy, 1),
        "high_occupancy_count": high_occupancy
    }

@router.get("/by-route/{route_id}")
async def get_buses_by_route(route_id: str):
    """Get all buses on a specific route"""
    buses = read_json("buses.json")
    return [b for b in buses if b.get("route_id") == route_id]

@router.get("/{bus_id}")
async def get_bus(bus_id: str):
    """Get single bus details"""
    buses = read_json("buses.json")
    for bus in buses:
        if bus["id"] == bus_id:
            return bus
    raise HTTPException(status_code=404, detail="Bus not found")

@router.patch("/{bus_id}/status")
async def update_bus_status(bus_id: str, update: BusStatusUpdate):
    """Update bus status (active/breakdown/break)"""
    buses = read_json("buses.json")
    for bus in buses:
        if bus["id"] == bus_id:
            bus["status"] = update.status
            if update.status in ["IDLE", "BREAKDOWN"]:
                bus["speed"] = "0km/h"
            write_json("buses.json", buses)
            return {"success": True, "message": f"Bus {bus_id} status updated to {update.status}"}
    raise HTTPException(status_code=404, detail="Bus not found")

@router.patch("/{bus_id}/location")
async def update_bus_location(bus_id: str, update: BusLocationUpdate):
    """Update bus coordinates (for live tracking simulation)"""
    buses = read_json("buses.json")
    for bus in buses:
        if bus["id"] == bus_id:
            bus["lat"] = update.lat
            bus["lng"] = update.lng
            if update.speed:
                bus["speed"] = update.speed
            write_json("buses.json", buses)
            return {"success": True, "message": "Location updated"}
    raise HTTPException(status_code=404, detail="Bus not found")

@router.patch("/{bus_id}/occupancy")
async def update_bus_occupancy(bus_id: str, update: BusOccupancyUpdate):
    """Update bus occupancy percentage"""
    buses = read_json("buses.json")
    for bus in buses:
        if bus["id"] == bus_id:
            bus["occupancy_percent"] = min(100, max(0, update.occupancy_percent))
            write_json("buses.json", buses)
            return {"success": True, "message": "Occupancy updated", "new_value": bus["occupancy_percent"]}
    raise HTTPException(status_code=404, detail="Bus not found")

@router.post("/simulate-movement")
async def simulate_bus_movement():
    """Simulate random bus movement for demo purposes"""
    buses = read_json("buses.json")
    
    for bus in buses:
        if bus.get("status") == "MOVING":
            # Small random movement
            bus["lat"] += random.uniform(-0.001, 0.001)
            bus["lng"] += random.uniform(-0.001, 0.001)
            # Random speed change
            bus["speed"] = f"{random.randint(10, 45)}km/h"
            # Random occupancy fluctuation
            current_occ = bus.get("occupancy_percent", 50)
            bus["occupancy_percent"] = max(0, min(100, current_occ + random.randint(-5, 5)))
    
    write_json("buses.json", buses)
    return {"success": True, "message": "Bus positions simulated"}
