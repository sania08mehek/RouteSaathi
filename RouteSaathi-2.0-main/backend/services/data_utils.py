"""
Data utility module for reading/writing JSON data files
"""

import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

# Get the data directory path (relative to backend folder)
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "data")

def get_data_path(filename: str) -> str:
    """Get the full path to a data file"""
    return os.path.join(DATA_DIR, filename)

def read_json(filename: str) -> List[Dict[str, Any]]:
    """Read data from a JSON file"""
    filepath = get_data_path(filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []

def write_json(filename: str, data: List[Dict[str, Any]]) -> bool:
    """Write data to a JSON file"""
    filepath = get_data_path(filename)
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error writing to {filename}: {e}")
        return False

def append_to_json(filename: str, item: Dict[str, Any]) -> bool:
    """Append a single item to a JSON array file"""
    data = read_json(filename)
    data.append(item)
    return write_json(filename, data)

def update_item_in_json(filename: str, key: str, key_value: str, updates: Dict[str, Any]) -> bool:
    """Update a specific item in a JSON array by key"""
    data = read_json(filename)
    for item in data:
        if item.get(key) == key_value:
            item.update(updates)
            return write_json(filename, data)
    return False

def delete_from_json(filename: str, key: str, key_value: str) -> bool:
    """Delete an item from a JSON array by key"""
    data = read_json(filename)
    filtered = [item for item in data if item.get(key) != key_value]
    if len(filtered) != len(data):
        return write_json(filename, filtered)
    return False

def find_by_key(filename: str, key: str, value: str) -> Optional[Dict[str, Any]]:
    """Find a single item by key value"""
    data = read_json(filename)
    for item in data:
        if item.get(key) == value:
            return item
    return None

def filter_by_key(filename: str, key: str, value: str) -> List[Dict[str, Any]]:
    """Filter items by key value"""
    data = read_json(filename)
    return [item for item in data if item.get(key) == value]

def generate_id(prefix: str = "ID") -> str:
    """Generate a unique ID with timestamp"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    return f"{prefix}-{timestamp}"
