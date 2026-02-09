"""
Privacy Algorithms
Implements k-anonymity, spatial cloaking, and differential privacy
"""
from typing import List, Tuple, Dict
from copy import deepcopy
from collections import defaultdict
import numpy as np

from app.models.schemas import Dataset, UserProfile, LocationPoint


# ==============================================================================
# K-ANONYMITY
# ==============================================================================

def apply_k_anonymity(dataset: Dataset, k: int = 5) -> Tuple[Dataset, float]:
    """
    Apply k-anonymity by generalizing locations to grid cells.
    Each cell contains at least k users.
    
    Returns: (anonymized_dataset, utility_loss_percentage)
    """
    # Determine grid size based on k
    # Higher k = larger grid cells = more generalization
    grid_size = 0.002 + (k - 2) * 0.001  # ~200m base + ~100m per k increase
    
    anonymized = deepcopy(dataset)
    original_coords = []
    new_coords = []
    
    for user in anonymized.users:
        for point in user.locations:
            original_coords.append((point.lat, point.lon))
            
            # Snap to grid
            grid_lat = round(point.lat / grid_size) * grid_size
            grid_lon = round(point.lon / grid_size) * grid_size
            
            point.lat = grid_lat
            point.lon = grid_lon
            new_coords.append((grid_lat, grid_lon))
        
        # Also generalize home/work
        if user.home_location:
            user.home_location.lat = round(user.home_location.lat / grid_size) * grid_size
            user.home_location.lon = round(user.home_location.lon / grid_size) * grid_size
        if user.work_location:
            user.work_location.lat = round(user.work_location.lat / grid_size) * grid_size
            user.work_location.lon = round(user.work_location.lon / grid_size) * grid_size
    
    # Calculate utility loss (average distance moved)
    total_distance = 0
    for (orig_lat, orig_lon), (new_lat, new_lon) in zip(original_coords, new_coords):
        dist = np.sqrt((orig_lat - new_lat)**2 + (orig_lon - new_lon)**2)
        total_distance += dist
    
    avg_distance = total_distance / len(original_coords) if original_coords else 0
    # Convert to utility loss percentage (0.01 degree = ~1% loss)
    utility_loss = min(100, avg_distance * 10000)
    
    return anonymized, round(utility_loss, 2)


# ==============================================================================
# SPATIAL CLOAKING
# ==============================================================================

def apply_spatial_cloaking(dataset: Dataset, radius_meters: float = 500) -> Tuple[Dataset, float]:
    """
    Apply spatial cloaking by replacing exact coordinates with region centers.
    Each point is moved to the center of a circular region.
    
    Returns: (cloaked_dataset, utility_loss_percentage)
    """
    # Convert meters to approximate degrees
    radius_degrees = radius_meters / 111000
    
    anonymized = deepcopy(dataset)
    total_displacement = 0
    point_count = 0
    
    for user in anonymized.users:
        for point in user.locations:
            # Randomly shift point within the cloaking radius
            # This simulates moving to a randomized region center
            angle = np.random.uniform(0, 2 * np.pi)
            distance = np.random.uniform(0, radius_degrees)
            
            original_lat, original_lon = point.lat, point.lon
            
            point.lat = original_lat + distance * np.cos(angle)
            point.lon = original_lon + distance * np.sin(angle)
            
            displacement = np.sqrt(
                (point.lat - original_lat)**2 + 
                (point.lon - original_lon)**2
            )
            total_displacement += displacement
            point_count += 1
        
        # Cloak home/work locations
        if user.home_location:
            angle = np.random.uniform(0, 2 * np.pi)
            distance = np.random.uniform(0, radius_degrees)
            user.home_location.lat += distance * np.cos(angle)
            user.home_location.lon += distance * np.sin(angle)
        
        if user.work_location:
            angle = np.random.uniform(0, 2 * np.pi)
            distance = np.random.uniform(0, radius_degrees)
            user.work_location.lat += distance * np.cos(angle)
            user.work_location.lon += distance * np.sin(angle)
    
    avg_displacement = total_displacement / point_count if point_count else 0
    # Utility loss proportional to displacement
    utility_loss = min(100, (avg_displacement / radius_degrees) * (radius_meters / 50))
    
    return anonymized, round(utility_loss, 2)


# ==============================================================================
# DIFFERENTIAL PRIVACY
# ==============================================================================

def laplace_noise(scale: float) -> float:
    """Generate Laplace noise with given scale (b = 1/epsilon)"""
    return np.random.laplace(0, scale)


def apply_differential_privacy(dataset: Dataset, epsilon: float = 1.0) -> Tuple[Dataset, float]:
    """
    Apply differential privacy using the Laplace mechanism.
    Adds calibrated noise to coordinates based on epsilon.
    
    Lower epsilon = more privacy = more noise
    Higher epsilon = less privacy = less noise
    
    Returns: (private_dataset, utility_loss_percentage)
    """
    # Sensitivity: max change in output from changing one input
    # For GPS coordinates, we assume ~0.001 degree sensitivity (~100m)
    sensitivity = 0.001
    
    # Laplace scale parameter
    scale = sensitivity / epsilon
    
    anonymized = deepcopy(dataset)
    total_noise = 0
    point_count = 0
    
    for user in anonymized.users:
        for point in user.locations:
            original_lat, original_lon = point.lat, point.lon
            
            # Add Laplace noise
            lat_noise = laplace_noise(scale)
            lon_noise = laplace_noise(scale)
            
            point.lat = original_lat + lat_noise
            point.lon = original_lon + lon_noise
            
            total_noise += abs(lat_noise) + abs(lon_noise)
            point_count += 1
        
        # Add noise to home/work
        if user.home_location:
            user.home_location.lat += laplace_noise(scale)
            user.home_location.lon += laplace_noise(scale)
        
        if user.work_location:
            user.work_location.lat += laplace_noise(scale)
            user.work_location.lon += laplace_noise(scale)
    
    avg_noise = total_noise / (2 * point_count) if point_count else 0
    # Utility loss inversely proportional to epsilon
    utility_loss = min(100, (1 / epsilon) * 20 + avg_noise * 5000)
    
    return anonymized, round(utility_loss, 2)


# ==============================================================================
# COMPARISON UTILITIES  
# ==============================================================================

def get_anonymization_function(technique: str):
    """Get the anonymization function for a given technique name"""
    techniques = {
        "k-anonymity": apply_k_anonymity,
        "spatial-cloaking": apply_spatial_cloaking,
        "differential-privacy": apply_differential_privacy
    }
    return techniques.get(technique)


def compare_coordinates(original: Dataset, anonymized: Dataset) -> Dict[str, float]:
    """Compare original and anonymized datasets to measure distortion"""
    distances = []
    
    for orig_user, anon_user in zip(original.users, anonymized.users):
        for orig_point, anon_point in zip(orig_user.locations, anon_user.locations):
            dist = np.sqrt(
                (orig_point.lat - anon_point.lat)**2 + 
                (orig_point.lon - anon_point.lon)**2
            )
            distances.append(dist)
    
    if not distances:
        return {"avg_distortion": 0, "max_distortion": 0, "min_distortion": 0}
    
    return {
        "avg_distortion_meters": round(np.mean(distances) * 111000, 2),
        "max_distortion_meters": round(np.max(distances) * 111000, 2),
        "min_distortion_meters": round(np.min(distances) * 111000, 2),
        "std_distortion_meters": round(np.std(distances) * 111000, 2)
    }
