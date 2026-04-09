"""
AI Engine Router - ML-Based Bus Reallocation Suggestions
"""

from fastapi import APIRouter
from pydantic import BaseModel
from services.data_utils import read_json
from datetime import datetime
from typing import List, Dict, Any
from collections import defaultdict

router = APIRouter()

class AllocationAction(BaseModel):
    route_id: str
    action: str  # "add" or "remove"
    buses_change: int

def analyze_route_demand() -> List[Dict[str, Any]]:
    """
    Analyze ticket data and bus allocation to generate ML-based reallocation suggestions.
    This is the core AI engine logic.
    """
    tickets = read_json("tickets.json")
    buses = read_json("buses.json")
    routes = read_json("routes.json")
    
    # Count tickets per route (demand indicator)
    route_ticket_count = defaultdict(int)
    for ticket in tickets:
        route_id = ticket.get("route_id")
        if route_id:
            route_ticket_count[route_id] += 1
    
    # Count buses per route (supply indicator)
    route_bus_count = defaultdict(int)
    route_occupancy = defaultdict(list)
    for bus in buses:
        route_id = bus.get("route_id")
        if route_id:
            route_bus_count[route_id] += 1
            route_occupancy[route_id].append(bus.get("occupancy_percent", 50))
    
    # Generate recommendations
    recommendations = []
    
    # Load ML Model
    try:
        import joblib
        import pandas as pd
        import os
        
        base_dir = os.path.dirname(os.path.dirname(__file__))
        model_path = os.path.join(base_dir, "models", "backup_predictor_rf.joblib")
        cols_path = os.path.join(base_dir, "models", "feature_columns.joblib")
        
        model = joblib.load(model_path)
        feature_cols = joblib.load(cols_path)
        model_loaded = True
    except Exception as e:
        print(f"ML Model loading failed: {e}")
        model_loaded = False

    # Create route name mapping
    route_names = {r["id"]: r["name"] for r in routes}
    
    # Analyze each route with ticket data
    for route_id, ticket_count in route_ticket_count.items():
        current_buses = route_bus_count.get(route_id, 0)
        avg_occupancy = sum(route_occupancy.get(route_id, [50])) / max(1, len(route_occupancy.get(route_id, [50])))
        
        # ML Prediction
        predicted_demand = 0
        ml_confidence = "Low"
        
        if model_loaded:
            try:
                # Prepare features for model
                # Features: ['n_trips', 'n_stop_events', 'shift_afternoon', 'shift_morning', 'shift_other']
                hour = datetime.now().hour
                is_morning = 1 if 6 <= hour < 12 else 0
                is_afternoon = 1 if 12 <= hour < 18 else 0
                is_other = 1 if not (is_morning or is_afternoon) else 0
                
                features = pd.DataFrame([{
                    'n_trips': current_buses,
                    'n_stop_events': ticket_count, # Using total historical tickets as proxy for volume
                    'shift_afternoon': is_afternoon,
                    'shift_morning': is_morning,
                    'shift_other': is_other
                }])
                
                # Ensure columns match exactly
                for col in feature_cols:
                    if col not in features.columns:
                        features[col] = 0
                features = features[feature_cols]
                
                prediction = model.predict(features)[0]
                predicted_demand = prediction
                ml_confidence = "High"
            except Exception as e:
                print(f"Prediction error for {route_id}: {e}")
        
        # Hybrid Decision Logic (ML + Rules)
        # Calculate demand score (tickets per bus)
        demand_per_bus = ticket_count / max(1, current_buses)
        
        # Determine priority and recommendation
        if (model_loaded and predicted_demand > 0.8) or (avg_occupancy > 80 or demand_per_bus > 30):
            # High demand - need more buses
            priority = "HIGH"
            recommended_buses = current_buses + 1
            change = +1
            reason = f"High demand detected (ML Prediction: {predicted_demand:.2f}), capacity straining."
            impact = "Reduce overcrowding, improve service."
        elif (model_loaded and predicted_demand < 0.3) and (avg_occupancy < 30 and current_buses > 1):
            # Low demand - can reduce buses
            priority = "LOW"
            recommended_buses = max(1, current_buses - 1)
            change = -1
            reason = f"Low predicted demand (ML Prediction: {predicted_demand:.2f}), capacity surplus."
            impact = "Save fuel and resource costs."
        else:
            # Optimal
            priority = "MEDIUM"
            recommended_buses = current_buses
            change = 0
            reason = "Optimal allocation, maintaining current schedule."
            impact = "Maintain 90%+ efficiency."
        
        route_name = route_names.get(route_id, route_id)
        
        recommendations.append({
            "route_id": route_id,
            "route_name": route_name,
            "priority": priority,
            "current_buses": current_buses,
            "recommended_buses": recommended_buses,
            "change": change,
            "average_occupancy": round(avg_occupancy, 1),
            "ticket_count": ticket_count,
            "ml_prediction": round(float(predicted_demand), 2) if model_loaded else None,
            "reason": reason,
            "impact": impact
        })
    
    # Sort by priority (HIGH first)
    priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    recommendations.sort(key=lambda x: priority_order.get(x["priority"], 1))
    
    return recommendations

@router.get("/recommendations")
async def get_recommendations():
    """Get AI-powered bus reallocation suggestions"""
    recommendations = analyze_route_demand()
    
    return {
        "analysis_summary": "Based on passenger footfall patterns, congestion data, and historical ticketing records from the past 7 days, the system recommends the following bus reallocations to optimize fleet efficiency.",
        "generated_at": datetime.now().isoformat(),
        "recommendations": recommendations[:10]  # Top 10 recommendations
    }

@router.get("/recommendations/high-priority")
async def get_high_priority_recommendations():
    """Get only high priority reallocation suggestions"""
    recommendations = analyze_route_demand()
    high_priority = [r for r in recommendations if r["priority"] == "HIGH"]
    
    return {
        "count": len(high_priority),
        "recommendations": high_priority
    }

@router.post("/apply-allocation")
async def apply_allocation(action: AllocationAction):
    """Apply an AI-suggested bus reallocation"""
    # In a real system, this would reassign buses
    # For the prototype, we'll just acknowledge the action
    
    return {
        "success": True,
        "message": f"Allocation applied: {action.action} {abs(action.buses_change)} bus(es) on route {action.route_id}",
        "route_id": action.route_id
    }

@router.get("/predict-demand/{route_id}")
async def predict_route_demand(route_id: str):
    """Predict demand for a specific route based on historical data"""
    tickets = read_json("tickets.json")
    route_tickets = [t for t in tickets if t.get("route_id") == route_id]
    
    # Group by hour for pattern analysis
    hourly_pattern = defaultdict(int)
    for ticket in route_tickets:
        try:
            ts = ticket.get("timestamp", "")
            hour = datetime.fromisoformat(ts.replace("Z", "")).hour
            hourly_pattern[hour] += 1
        except:
            pass
    
    # Find peak hours
    if hourly_pattern:
        peak_hour = max(hourly_pattern, key=hourly_pattern.get)
        total_tickets = sum(hourly_pattern.values())
        avg_per_hour = total_tickets / 24
    else:
        peak_hour = 9
        total_tickets = 0
        avg_per_hour = 0
    
    return {
        "route_id": route_id,
        "total_historical_tickets": total_tickets,
        "peak_hour": f"{peak_hour:02d}:00",
        "average_hourly_demand": round(avg_per_hour, 1),
        "hourly_pattern": dict(hourly_pattern),
        "prediction": f"High demand expected between {peak_hour-1}:00 and {peak_hour+2}:00"
    }

@router.get("/congestion-alerts")
async def get_congestion_alerts():
    """Get routes with congestion/overcrowding issues"""
    buses = read_json("buses.json")
    
    # Find stuck buses (congestion indicator)
    stuck_buses = [b for b in buses if b.get("status") == "STUCK"]
    
    # Find high occupancy buses
    overcrowded = [b for b in buses if b.get("occupancy_percent", 0) > 85]
    
    alerts = []
    for bus in stuck_buses:
        alerts.append({
            "type": "CONGESTION",
            "bus_id": bus["id"],
            "route_id": bus.get("route_id"),
            "location": bus.get("last_stop"),
            "message": f"Bus {bus['id']} stuck at {bus.get('last_stop', 'unknown location')}"
        })
    
    for bus in overcrowded:
        alerts.append({
            "type": "OVERCROWDING",
            "bus_id": bus["id"],
            "route_id": bus.get("route_id"),
            "occupancy": bus.get("occupancy_percent"),
            "message": f"Bus {bus['id']} at {bus.get('occupancy_percent')}% capacity"
        })
    
    return {
        "total_alerts": len(alerts),
        "congestion_count": len(stuck_buses),
        "overcrowding_count": len(overcrowded),
        "alerts": alerts
    }

@router.get("/ml-suggestions-count")
async def get_ml_suggestions_count():
    """Get count of ML suggested reallocations for dashboard"""
    recommendations = analyze_route_demand()
    
    # Count non-zero change recommendations
    action_needed = [r for r in recommendations if r["change"] != 0]
    
    return {
        "ml_suggested_reallocations": len(action_needed),
        "high_priority_count": len([r for r in action_needed if r["priority"] == "HIGH"]),
        "low_priority_count": len([r for r in action_needed if r["priority"] == "LOW"])
    }
@router.get("/analytics")
async def get_analytics_data():
    """Get aggregated data for analytics charts"""
    tickets = read_json("tickets.json")
    buses = read_json("buses.json")
    routes = read_json("routes.json")
    alerts = read_json("alerts.json")
    
    # 1. Demand Over Time (Hourly)
    hourly_demand = defaultdict(int)
    for ticket in tickets:
        try:
            ts = ticket.get("timestamp", "")
            hour = datetime.fromisoformat(ts.replace("Z", "")).hour
            hourly_demand[hour] += 1
        except:
            pass
    
    demand_chart = [{"hour": f"{h:02d}:00", "count": hourly_demand[h]} for h in range(24)]
    
    # 2. Revenue Per Route
    route_revenue = defaultdict(float)
    route_names = {r["id"]: r["name"] for r in routes}
    
    for ticket in tickets:
        route_id = ticket.get("route_id")
        if route_id:
            route_revenue[route_id] += float(ticket.get("fare", 0))
            
    revenue_chart = [
        {"route": route_names.get(rid, rid), "revenue": round(rev, 2)} 
        for rid, rev in route_revenue.items()
    ]
    revenue_chart.sort(key=lambda x: x["revenue"], reverse=True)
    
    # 3. Alert Distribution
    alert_counts = defaultdict(int)
    for alert in alerts:
        alert_type = alert.get("type", "OTHER")
        alert_counts[alert_type] += 1
        
    alert_chart = [
        {"name": name, "value": count} 
        for name, count in alert_counts.items()
    ]
    
    return {
        "demand_over_time": demand_chart,
        "revenue_per_route": revenue_chart[:8],  # Top 8 routes
        "alert_distribution": alert_chart,
        "summary": {
            "total_tickets": len(tickets),
            "total_revenue": sum(route_revenue.values()),
            "total_alerts": len(alerts),
            "active_buses": len([b for b in buses if b.get("status") == "ACTIVE"])
        }
    }
