"""
Routes Router - Route Management Endpoints
"""

from fastapi import APIRouter, HTTPException
from services.data_utils import read_json, find_by_key
from typing import List, Dict

router = APIRouter()

@router.get("/")
async def get_all_routes():
    """Get all routes"""
    routes = read_json("routes.json")
    return routes

@router.get("/stats")
async def get_route_stats():
    """Get route statistics for dashboard"""
    routes = read_json("routes.json")
    buses = read_json("buses.json")
    tickets = read_json("tickets.json")
    
    total_routes = len(routes)
    
    # Count buses per route
    route_bus_count = {}
    for bus in buses:
        route_id = bus.get("route_id")
        if route_id:
            route_bus_count[route_id] = route_bus_count.get(route_id, 0) + 1
    
    # Count tickets per route (last 7 days for demand)
    route_demand = {}
    for ticket in tickets:
        route_id = ticket.get("route_id")
        if route_id:
            route_demand[route_id] = route_demand.get(route_id, 0) + 1
    
    # Identify high demand vs low demand routes
    avg_demand = sum(route_demand.values()) / len(route_demand) if route_demand else 0
    high_demand_routes = [r for r, d in route_demand.items() if d > avg_demand * 1.5]
    low_demand_routes = [r for r, d in route_demand.items() if d < avg_demand * 0.5]
    
    return {
        "total_routes": total_routes,
        "routes_with_high_demand": len(high_demand_routes),
        "routes_with_low_demand": len(low_demand_routes),
        "high_demand_route_ids": high_demand_routes[:5],
        "low_demand_route_ids": low_demand_routes[:5]
    }

@router.get("/{route_id}")
async def get_route(route_id: str):
    """Get route details with stops"""
    routes = read_json("routes.json")
    for route in routes:
        if route["id"] == route_id:
            return route
    raise HTTPException(status_code=404, detail="Route not found")

@router.get("/{route_id}/buses")
async def get_buses_on_route(route_id: str):
    """Get all buses currently on a route"""
    buses = read_json("buses.json")
    return [b for b in buses if b.get("route_id") == route_id]

@router.get("/search/{query}")
async def search_routes(query: str):
    """Search routes by name or stop"""
    routes = read_json("routes.json")
    query = query.lower()
    
    results = []
    for route in routes:
        name = route.get("name", "").lower()
        stops = [s.lower() for s in route.get("stops", [])]
        
        if query in name or any(query in stop for stop in stops):
            results.append(route)
    
    return results[:10]  # Limit to 10 results
