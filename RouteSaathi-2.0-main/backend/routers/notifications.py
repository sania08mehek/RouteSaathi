"""
Notifications Router - Broadcast and Alert System
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.data_utils import read_json, write_json, generate_id
from datetime import datetime
from typing import Optional, List

router = APIRouter()

class BroadcastMessage(BaseModel):
    message: str
    priority: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    type: str = "BROADCAST"  # BROADCAST, SOS, TRAFFIC, BREAKDOWN

class SOSAlert(BaseModel):
    bus_id: str
    location: List[float]  # [lat, lng]
    type: str = "SOS"
    message: Optional[str] = None

class TrafficReport(BaseModel):
    bus_id: str
    location: List[float]
    message: str

@router.get("/")
async def get_all_notifications():
    """Get all alerts and notifications"""
    alerts = read_json("alerts.json")
    # Sort by timestamp descending
    alerts.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return alerts

@router.get("/recent")
async def get_recent_notifications(limit: int = 10):
    """Get recent notifications for dashboard"""
    alerts = read_json("alerts.json")
    alerts.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return alerts[:limit]

@router.get("/unread")
async def get_unread_notifications():
    """Get unread notifications"""
    alerts = read_json("alerts.json")
    return [a for a in alerts if a.get("status") == "UNREAD"]

@router.get("/by-type/{alert_type}")
async def get_notifications_by_type(alert_type: str):
    """Get notifications by type"""
    alerts = read_json("alerts.json")
    return [a for a in alerts if a.get("type", "").upper() == alert_type.upper()]

@router.post("/broadcast")
async def send_broadcast(message_data: BroadcastMessage):
    """Send broadcast message to all conductors"""
    alerts = read_json("alerts.json")
    
    new_alert = {
        "id": generate_id("ALRT"),
        "timestamp": datetime.now().isoformat(),
        "sender": "U001",  # Coordinator
        "type": message_data.type,
        "priority": message_data.priority,
        "message": message_data.message,
        "status": "SENT"
    }
    
    alerts.append(new_alert)
    write_json("alerts.json", alerts)
    
    return {"success": True, "alert_id": new_alert["id"], "message": "Broadcast sent successfully"}

@router.post("/sos")
async def send_sos_alert(sos_data: SOSAlert):
    """Handle SOS emergency alert from conductor or passenger"""
    alerts = read_json("alerts.json")
    
    new_alert = {
        "id": generate_id("SOS"),
        "timestamp": datetime.now().isoformat(),
        "sender": "CONDUCTOR",
        "type": "SOS",
        "priority": "CRITICAL",
        "message": sos_data.message or f"EMERGENCY: SOS triggered on Bus {sos_data.bus_id}. Immediate assistance required.",
        "status": "ACTIVE",
        "location": sos_data.location,
        "bus_id": sos_data.bus_id
    }
    
    alerts.append(new_alert)
    write_json("alerts.json", alerts)
    
    return {"success": True, "alert_id": new_alert["id"], "message": "SOS Alert sent to Control Center"}

@router.post("/traffic")
async def report_traffic(report: TrafficReport):
    """Report traffic issue from conductor"""
    alerts = read_json("alerts.json")
    
    new_alert = {
        "id": generate_id("TRF"),
        "timestamp": datetime.now().isoformat(),
        "sender": "CONDUCTOR",
        "type": "TRAFFIC",
        "priority": "MEDIUM",
        "message": report.message,
        "status": "ACTIVE",
        "location": report.location,
        "bus_id": report.bus_id
    }
    
    alerts.append(new_alert)
    write_json("alerts.json", alerts)
    
    return {"success": True, "alert_id": new_alert["id"], "message": "Traffic report submitted"}

@router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Mark an alert as resolved"""
    alerts = read_json("alerts.json")
    
    for alert in alerts:
        if alert["id"] == alert_id:
            alert["status"] = "RESOLVED"
            write_json("alerts.json", alerts)
            return {"success": True, "message": "Alert resolved"}
    
    raise HTTPException(status_code=404, detail="Alert not found")

@router.patch("/{alert_id}/read")
async def mark_as_read(alert_id: str):
    """Mark a notification as read"""
    alerts = read_json("alerts.json")
    
    for alert in alerts:
        if alert["id"] == alert_id:
            alert["status"] = "READ"
            write_json("alerts.json", alerts)
            return {"success": True}
    
    raise HTTPException(status_code=404, detail="Alert not found")

@router.get("/stats")
async def get_notification_stats():
    """Get notification statistics for dashboard"""
    alerts = read_json("alerts.json")
    
    total = len(alerts)
    unread = len([a for a in alerts if a.get("status") == "UNREAD"])
    active = len([a for a in alerts if a.get("status") == "ACTIVE"])
    congestion = len([a for a in alerts if a.get("type") == "CONGESTION"])
    
    return {
        "total_alerts": total,
        "unread_count": unread,
        "active_count": active,
        "congestion_alerts": congestion
    }
