"""
Conductors Router - Conductor-specific endpoints for the Conductor app
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.data_utils import read_json, write_json
from datetime import datetime
from typing import Optional, List

router = APIRouter()

# Mock conductor assignments
CONDUCTOR_ASSIGNMENTS = {
    "U002": {
        "bus_number": "KA-01-F-4532",
        "route_id": "335E",
        "route_name": "Kempegowda Bus Station → Electronic City",
        "start_time": "06:30 AM",
        "end_time": "10:30 PM",
        "status": "ACTIVE"
    },
    "U003": {
        "bus_number": "KA-22-W-7547",
        "route_id": "R-KBS-1",
        "route_name": "Majestic → Hebbal → Yelahanka",
        "start_time": "05:00 AM",
        "end_time": "09:00 PM",
        "status": "ACTIVE"
    },
    "U004": {
        "bus_number": "KA-03-W-1087",
        "route_id": "R-201",
        "route_name": "Bannerghatta → Jayanagar → Majestic",
        "start_time": "06:00 AM",
        "end_time": "10:00 PM",
        "status": "ACTIVE"
    },
    "U005": {
        "bus_number": "KA-01-F-3421",
        "route_id": "G-10",
        "route_name": "Marathahalli → Whitefield ITPL",
        "start_time": "07:00 AM",
        "end_time": "11:00 PM",
        "status": "ACTIVE"
    },
    "U006": {
        "bus_number": "KA-01-F-5678",
        "route_id": "R-500D",
        "route_name": "Silk Board → Hebbal via ORR",
        "start_time": "05:30 AM",
        "end_time": "09:30 PM",
        "status": "ACTIVE"
    },
    "U007": {
        "bus_number": "KA-01-F-7890",
        "route_id": "R-365C",
        "route_name": "Banashankari → Bannerghatta Rd",
        "start_time": "06:00 AM",
        "end_time": "10:00 PM",
        "status": "ACTIVE"
    }
}

class StatusUpdate(BaseModel):
    status: str  # ON_DUTY, ON_BREAK, BREAKDOWN

class BreakdownReport(BaseModel):
    bus_id: str
    location: List[float]
    issue: str

@router.get("/assignment/{conductor_id}")
async def get_conductor_assignment(conductor_id: str):
    """Get today's assignment for a conductor"""
    assignment = CONDUCTOR_ASSIGNMENTS.get(conductor_id)
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Get current location from bus data
    buses = read_json("buses.json")
    bus = next((b for b in buses if b["id"] == assignment["bus_number"]), None)
    
    tracking_info = {
        "current_location": bus.get("last_stop", "Unknown") if bus else "Unknown",
        "next_stop": "BTM Layout",  # Mock next stop
        "distance_to_destination": "12.5 km",
        "gps_status": "Connected"
    }
    
    return {
        "date": datetime.now().strftime("%A, %d %B %Y"),
        **assignment,
        "tracking": tracking_info
    }

@router.get("/notifications/{conductor_id}")
async def get_conductor_notifications(conductor_id: str):
    """Get notifications for a specific conductor"""
    alerts = read_json("alerts.json")
    
    # Get broadcasts and relevant alerts
    conductor_alerts = [
        a for a in alerts 
        if a.get("type") in ["BROADCAST", "INFO", "TRAFFIC"] or a.get("priority") == "CRITICAL"
    ]
    
    # Sort by timestamp and take recent ones
    conductor_alerts.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    notifications = []
    for alert in conductor_alerts[:5]:
        notifications.append({
            "id": alert.get("id"),
            "title": get_notification_title(alert.get("type")),
            "message": alert.get("message"),
            "time_ago": get_time_ago(alert.get("timestamp")),
            "priority": alert.get("priority")
        })
    
    return {
        "new_count": len([n for n in notifications if n.get("priority") in ["HIGH", "CRITICAL"]]),
        "notifications": notifications
    }

def get_notification_title(alert_type: str) -> str:
    """Get title based on alert type"""
    titles = {
        "BROADCAST": "Route Change Alert",
        "TRAFFIC": "Traffic Update",
        "INFO": "System Update",
        "CONGESTION": "Passenger Load Update"
    }
    return titles.get(alert_type, "Notification")

def get_time_ago(timestamp: str) -> str:
    """Convert timestamp to human readable time ago"""
    if not timestamp:
        return "Unknown"
    try:
        dt = datetime.fromisoformat(timestamp.replace("Z", ""))
        diff = datetime.now() - dt
        minutes = int(diff.total_seconds() / 60)
        
        if minutes < 1:
            return "Just now"
        elif minutes < 60:
            return f"{minutes} minutes ago"
        elif minutes < 1440:
            hours = minutes // 60
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        else:
            days = minutes // 1440
            return f"{days} day{'s' if days > 1 else ''} ago"
    except:
        return "Unknown"

@router.patch("/status/{conductor_id}")
async def update_conductor_status(conductor_id: str, update: StatusUpdate):
    """Update conductor duty status"""
    if conductor_id in CONDUCTOR_ASSIGNMENTS:
        CONDUCTOR_ASSIGNMENTS[conductor_id]["status"] = update.status
        return {"success": True, "message": f"Status updated to {update.status}"}
    
    raise HTTPException(status_code=404, detail="Conductor not found")

@router.post("/breakdown-report")
async def report_breakdown(report: BreakdownReport):
    """Report bus breakdown"""
    alerts = read_json("alerts.json")
    buses = read_json("buses.json")
    
    # Update bus status
    for bus in buses:
        if bus["id"] == report.bus_id:
            bus["status"] = "BREAKDOWN"
            bus["speed"] = "0km/h"
            break
    
    # Create alert
    new_alert = {
        "id": f"BRK-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "timestamp": datetime.now().isoformat(),
        "sender": "CONDUCTOR",
        "type": "BREAKDOWN",
        "priority": "HIGH",
        "message": f"Breakdown Report: {report.issue} on Bus {report.bus_id}",
        "status": "ACTIVE",
        "location": report.location,
        "bus_id": report.bus_id
    }
    
    alerts.append(new_alert)
    write_json("alerts.json", alerts)
    write_json("buses.json", buses)
    
    return {"success": True, "alert_id": new_alert["id"], "message": "Breakdown reported to Control Center"}

@router.get("/quick-actions")
async def get_quick_actions():
    """Get available quick actions for conductor"""
    return [
        {"id": "sos", "label": "SOS Emergency", "icon": "🔴", "color": "#EF4444"},
        {"id": "traffic", "label": "Report Traffic", "icon": "🟡", "color": "#F59E0B"},
        {"id": "breakdown", "label": "Bus Breakdown", "icon": "⚫", "color": "#1F2937"},
        {"id": "full", "label": "Bus Full", "icon": "🟢", "color": "#10B981"}
    ]

@router.get("/all")
async def get_all_conductors():
    """Get all conductors with their current status"""
    conductors = []
    for cid, assignment in CONDUCTOR_ASSIGNMENTS.items():
        conductors.append({
            "id": cid,
            "name": get_conductor_name(cid),
            "bus_id": assignment["bus_number"],
            "route_id": assignment["route_id"],
            "status": "online" if assignment["status"] == "ACTIVE" else "offline",
            "last_active": "Now" if assignment["status"] == "ACTIVE" else "5 mins ago"
        })
    return conductors

def get_conductor_name(conductor_id: str) -> str:
    """Get conductor name by ID"""
    names = {
        "U002": "Ganesh Rao",
        "U003": "Ramesh Kumar",
        "U004": "Suresh Reddy",
        "U005": "Prakash M",
        "U006": "Anil S",
        "U007": "Venkatesh"
    }
    return names.get(conductor_id, "Unknown")
