"""
Synthetic Dataset Generator
Generates realistic location data with daily patterns for Calgary, AB
"""
import random
from datetime import datetime, timedelta
from typing import List, Tuple, Optional
import numpy as np

from app.core.config import (
    CITY_CENTER, CITY_BOUNDS, CALGARY_LANDMARKS,
    NUM_USERS_MIN, NUM_USERS_MAX,
    POINTS_PER_USER_MIN, POINTS_PER_USER_MAX
)
from app.models.schemas import LocationPoint, UserProfile, Dataset


def generate_home_location() -> Tuple[float, float]:
    """Generate a random home location within Calgary residential areas"""
    # Bias towards residential neighborhoods
    residential_areas = [
        (51.05, -114.11),  # Kensington
        (51.08, -114.08),  # North Hill
        (51.02, -114.08),  # Beltline
        (50.95, -114.07),  # South Calgary
        (51.10, -114.15),  # Varsity
        (51.03, -114.03),  # Inglewood
        (51.06, -114.05),  # Bridgeland
        (51.00, -114.05),  # Mission
        (51.12, -114.20),  # Bowness
    ]
    
    base = random.choice(residential_areas)
    # Add some randomness (approx 1-2km radius)
    lat = base[0] + random.gauss(0, 0.01)
    lon = base[1] + random.gauss(0, 0.01)
    
    return (
        max(min(lat, CITY_BOUNDS["max_lat"]), CITY_BOUNDS["min_lat"]),
        max(min(lon, CITY_BOUNDS["max_lon"]), CITY_BOUNDS["min_lon"])
    )


def generate_work_location() -> Tuple[float, float]:
    """Generate a work location, biased towards downtown and business areas"""
    work_areas = [
        CALGARY_LANDMARKS["downtown"],
        CALGARY_LANDMARKS["university"],
        CALGARY_LANDMARKS["south_health_campus"],
        (51.05, -114.07),  # Downtown core
        (51.04, -114.06),  # Stephen Ave area
        (51.08, -114.13),  # University area
    ]
    
    base = random.choice(work_areas)
    lat = base[0] + random.gauss(0, 0.005)
    lon = base[1] + random.gauss(0, 0.005)
    
    return (
        max(min(lat, CITY_BOUNDS["max_lat"]), CITY_BOUNDS["min_lat"]),
        max(min(lon, CITY_BOUNDS["max_lon"]), CITY_BOUNDS["min_lon"])
    )


def generate_leisure_locations(n: int = 3) -> List[Tuple[float, float]]:
    """Generate frequently visited leisure locations"""
    leisure_spots = list(CALGARY_LANDMARKS.values())
    selected = random.sample(leisure_spots, min(n, len(leisure_spots)))
    
    # Add some noise
    result = []
    for spot in selected:
        lat = spot[0] + random.gauss(0, 0.003)
        lon = spot[1] + random.gauss(0, 0.003)
        result.append((
            max(min(lat, CITY_BOUNDS["max_lat"]), CITY_BOUNDS["min_lat"]),
            max(min(lon, CITY_BOUNDS["max_lon"]), CITY_BOUNDS["min_lon"])
        ))
    return result


def interpolate_transit(start: Tuple[float, float], end: Tuple[float, float], 
                        num_points: int = 3) -> List[Tuple[float, float]]:
    """Generate transit points between two locations"""
    points = []
    for i in range(1, num_points + 1):
        t = i / (num_points + 1)
        lat = start[0] + t * (end[0] - start[0]) + random.gauss(0, 0.002)
        lon = start[1] + t * (end[1] - start[1]) + random.gauss(0, 0.002)
        points.append((lat, lon))
    return points


def generate_day_trajectory(
    date: datetime,
    home: Tuple[float, float],
    work: Optional[Tuple[float, float]],
    leisure_spots: List[Tuple[float, float]],
    is_weekday: bool
) -> List[LocationPoint]:
    """Generate a realistic day's worth of location data"""
    points = []
    
    # Morning at home (6-8 AM)
    morning_time = date.replace(hour=random.randint(6, 7), minute=random.randint(0, 59))
    points.append(LocationPoint(
        lat=home[0] + random.gauss(0, 0.0005),
        lon=home[1] + random.gauss(0, 0.0005),
        timestamp=morning_time,
        location_type="home"
    ))
    
    if is_weekday and work:
        # Commute to work (8-9 AM)
        commute_start = date.replace(hour=random.randint(7, 8), minute=random.randint(30, 59))
        transit_points = interpolate_transit(home, work, random.randint(2, 4))
        for i, tp in enumerate(transit_points):
            points.append(LocationPoint(
                lat=tp[0],
                lon=tp[1],
                timestamp=commute_start + timedelta(minutes=10 * (i + 1)),
                location_type="transit"
            ))
        
        # At work (9 AM - 5 PM, multiple readings)
        work_start = date.replace(hour=9, minute=random.randint(0, 30))
        for hour_offset in [0, 2, 4, 6, 8]:
            points.append(LocationPoint(
                lat=work[0] + random.gauss(0, 0.0003),
                lon=work[1] + random.gauss(0, 0.0003),
                timestamp=work_start + timedelta(hours=hour_offset),
                location_type="work"
            ))
        
        # Commute home (5-6 PM)
        commute_home_start = date.replace(hour=17, minute=random.randint(0, 30))
        transit_points = interpolate_transit(work, home, random.randint(2, 4))
        for i, tp in enumerate(transit_points):
            points.append(LocationPoint(
                lat=tp[0],
                lon=tp[1],
                timestamp=commute_home_start + timedelta(minutes=10 * (i + 1)),
                location_type="transit"
            ))
    else:
        # Weekend or no work - visit leisure spots
        if leisure_spots and random.random() > 0.3:
            spot = random.choice(leisure_spots)
            visit_time = date.replace(hour=random.randint(10, 15), minute=random.randint(0, 59))
            
            # Transit to spot
            transit_points = interpolate_transit(home, spot, 2)
            for i, tp in enumerate(transit_points):
                points.append(LocationPoint(
                    lat=tp[0],
                    lon=tp[1],
                    timestamp=visit_time + timedelta(minutes=5 * (i + 1)),
                    location_type="transit"
                ))
            
            # At the spot
            points.append(LocationPoint(
                lat=spot[0] + random.gauss(0, 0.0005),
                lon=spot[1] + random.gauss(0, 0.0005),
                timestamp=visit_time + timedelta(minutes=30),
                location_type="leisure"
            ))
            points.append(LocationPoint(
                lat=spot[0] + random.gauss(0, 0.0005),
                lon=spot[1] + random.gauss(0, 0.0005),
                timestamp=visit_time + timedelta(hours=2),
                location_type="leisure"
            ))
    
    # Evening at home (7-11 PM)
    for hour in [19, 21]:
        evening_time = date.replace(hour=hour, minute=random.randint(0, 59))
        points.append(LocationPoint(
            lat=home[0] + random.gauss(0, 0.0005),
            lon=home[1] + random.gauss(0, 0.0005),
            timestamp=evening_time,
            location_type="home"
        ))
    
    return sorted(points, key=lambda p: p.timestamp)


def generate_user_profile(user_id: str, num_days: int = 14) -> UserProfile:
    """Generate a complete user profile with location history"""
    home = generate_home_location()
    work = generate_work_location() if random.random() > 0.15 else None  # 85% have work
    leisure_spots = generate_leisure_locations(random.randint(2, 5))
    
    all_locations = []
    start_date = datetime.now() - timedelta(days=num_days)
    
    for day_offset in range(num_days):
        current_date = start_date + timedelta(days=day_offset)
        is_weekday = current_date.weekday() < 5
        
        day_points = generate_day_trajectory(
            current_date, home, work, leisure_spots, is_weekday
        )
        all_locations.extend(day_points)
    
    # Create home/work location points
    home_point = LocationPoint(
        lat=home[0], lon=home[1],
        timestamp=datetime.now(),
        location_type="home"
    )
    work_point = LocationPoint(
        lat=work[0], lon=work[1],
        timestamp=datetime.now(),
        location_type="work"
    ) if work else None
    
    return UserProfile(
        user_id=user_id,
        locations=all_locations,
        home_location=home_point,
        work_location=work_point
    )


def generate_dataset(num_users: Optional[int] = None) -> Dataset:
    """Generate a complete dataset with multiple users"""
    if num_users is None:
        num_users = random.randint(NUM_USERS_MIN, NUM_USERS_MAX)
    
    users = []
    for i in range(num_users):
        user_id = f"user_{i+1:03d}"
        num_days = random.randint(7, 21)  # 1-3 weeks of data
        user_profile = generate_user_profile(user_id, num_days)
        users.append(user_profile)
    
    return Dataset(
        users=users,
        generated_at=datetime.now(),
        city="Calgary"
    )
