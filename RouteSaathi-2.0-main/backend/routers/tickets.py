"""
Tickets Router - Ticketing System Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.data_utils import read_json, write_json, generate_id
from datetime import datetime
from typing import Optional

router = APIRouter()

class TicketCreate(BaseModel):
    bus_id: str
    route_id: str
    from_stop: str
    to_stop: str
    fare: int
    quantity: int = 1

class TicketResponse(BaseModel):
    success: bool
    ticket_id: str
    message: str

@router.get("/")
async def get_all_tickets():
    """Get all tickets (for admin/analytics)"""
    tickets = read_json("tickets.json")
    return tickets[-100:]  # Return last 100 tickets

@router.get("/stats")
async def get_ticket_stats():
    """Get ticketing statistics"""
    tickets = read_json("tickets.json")
    
    total_tickets = len(tickets)
    total_revenue = sum(t.get("fare", 0) for t in tickets)
    
    # Group by route
    route_sales = {}
    for t in tickets:
        route_id = t.get("route_id")
        if route_id:
            route_sales[route_id] = route_sales.get(route_id, 0) + 1
    
    # Top routes
    top_routes = sorted(route_sales.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "total_tickets": total_tickets,
        "total_revenue": total_revenue,
        "top_routes": [{"route_id": r, "ticket_count": c} for r, c in top_routes]
    }

@router.post("/issue")
async def issue_ticket(ticket_data: TicketCreate):
    """Issue a new ticket (from conductor)"""
    tickets = read_json("tickets.json")
    buses = read_json("buses.json")
    
    # Create ticket(s)
    new_tickets = []
    for _ in range(ticket_data.quantity):
        ticket_id = generate_id("T")
        new_ticket = {
            "tid": ticket_id,
            "bus_id": ticket_data.bus_id,
            "route_id": ticket_data.route_id,
            "timestamp": datetime.now().isoformat(),
            "from": ticket_data.from_stop,
            "to": ticket_data.to_stop,
            "fare": ticket_data.fare
        }
        tickets.append(new_ticket)
        new_tickets.append(ticket_id)
    
    # Update bus occupancy
    for bus in buses:
        if bus["id"] == ticket_data.bus_id:
            current_occ = bus.get("occupancy_percent", 0)
            # Each ticket adds ~2% occupancy (assuming 50 seat capacity)
            bus["occupancy_percent"] = min(100, current_occ + (ticket_data.quantity * 2))
            break
    
    write_json("tickets.json", tickets)
    write_json("buses.json", buses)
    
    return {
        "success": True,
        "ticket_ids": new_tickets,
        "message": f"Issued {ticket_data.quantity} ticket(s) successfully"
    }

@router.get("/by-bus/{bus_id}")
async def get_tickets_by_bus(bus_id: str):
    """Get recent tickets issued on a bus"""
    tickets = read_json("tickets.json")
    bus_tickets = [t for t in tickets if t.get("bus_id") == bus_id]
    return bus_tickets[-20:]  # Last 20 tickets

@router.get("/by-route/{route_id}")
async def get_tickets_by_route(route_id: str):
    """Get tickets for a specific route"""
    tickets = read_json("tickets.json")
    route_tickets = [t for t in tickets if t.get("route_id") == route_id]
    return route_tickets[-50:]  # Last 50 tickets

@router.get("/hourly-demand/{route_id}")
async def get_hourly_demand(route_id: str):
    """Get hourly demand pattern for a route (for AI training)"""
    tickets = read_json("tickets.json")
    route_tickets = [t for t in tickets if t.get("route_id") == route_id]
    
    # Group by hour
    hourly = {f"{h:02d}:00": 0 for h in range(24)}
    for t in route_tickets:
        ts = t.get("timestamp", "")
        try:
            hour = datetime.fromisoformat(ts.replace("Z", "")).hour
            hourly[f"{hour:02d}:00"] += 1
        except:
            pass
    
    return hourly
