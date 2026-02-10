
from typing import List, Tuple, Dict
from collections import Counter
import numpy as np
from sklearn.cluster import DBSCAN

from app.models.schemas import (
    UserProfile, Dataset, RiskScore, LocationPoint, PatternResult
)


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000
    
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)
    
    a = np.sin(delta_phi/2)**2 + np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda/2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
    
    return R * c


def cluster_locations(points: List[LocationPoint], eps_meters: float = 100) -> List[List[LocationPoint]]:

    if len(points) < 2:
        return [points] if points else []
    
    coords = np.array([[p.lat, p.lon] for p in points])
    
    eps_degrees = eps_meters / 111000
    
    clustering = DBSCAN(eps=eps_degrees, min_samples=2, metric='euclidean').fit(coords)
    
    clusters: Dict[int, List[LocationPoint]] = {}
    for i, label in enumerate(clustering.labels_):
        if label == -1:
            continue
        if label not in clusters:
            clusters[label] = []
        clusters[label].append(points[i])
    
    return list(clusters.values())


def infer_home_location(user: UserProfile) -> Tuple[float, float] | None:

    night_points = [
        p for p in user.locations 
        if p.timestamp.hour >= 22 or p.timestamp.hour <= 6
    ]
    
    if len(night_points) < 3:
        return None
    
    clusters = cluster_locations(night_points, eps_meters=150)
    if not clusters:
        return None
    

    largest_cluster = max(clusters, key=len)
    avg_lat = np.mean([p.lat for p in largest_cluster])
    avg_lon = np.mean([p.lon for p in largest_cluster])
    
    return (avg_lat, avg_lon)


def infer_work_location(user: UserProfile) -> Tuple[float, float] | None:

    work_time_points = [
        p for p in user.locations 
        if p.timestamp.weekday() < 5 and 9 <= p.timestamp.hour <= 17
    ]
    
    if len(work_time_points) < 5:
        return None
    
    clusters = cluster_locations(work_time_points, eps_meters=200)
    if not clusters:
        return None
    

    home = infer_home_location(user)
    

    valid_clusters = []
    for cluster in clusters:
        avg_lat = np.mean([p.lat for p in cluster])
        avg_lon = np.mean([p.lon for p in cluster])
        
        if home:
            dist_to_home = haversine_distance(avg_lat, avg_lon, home[0], home[1])
            if dist_to_home > 500:
                valid_clusters.append((cluster, avg_lat, avg_lon))
        else:
            valid_clusters.append((cluster, avg_lat, avg_lon))
    
    if not valid_clusters:
        return None
    
    largest = max(valid_clusters, key=lambda x: len(x[0]))
    return (largest[1], largest[2])


def calculate_trajectory_signature(user: UserProfile) -> str:


    home = infer_home_location(user)
    work = infer_work_location(user)
    

    sig_parts = []
    if home:
        sig_parts.append(f"H:{round(home[0], 3)},{round(home[1], 3)}")
    if work:
        sig_parts.append(f"W:{round(work[0], 3)},{round(work[1], 3)}")
    

    clusters = cluster_locations(user.locations, eps_meters=300)
    frequent_locs = sorted(clusters, key=len, reverse=True)[:3]
    for i, cluster in enumerate(frequent_locs):
        avg_lat = round(np.mean([p.lat for p in cluster]), 3)
        avg_lon = round(np.mean([p.lon for p in cluster]), 3)
        sig_parts.append(f"L{i}:{avg_lat},{avg_lon}")
    
    return "|".join(sig_parts)


def identify_unique_patterns(user: UserProfile, all_users: List[UserProfile]) -> List[str]:

    patterns = []
    

    home = infer_home_location(user)
    if home:
        nearby_homes = 0
        for other in all_users:
            if other.user_id == user.user_id:
                continue
            other_home = infer_home_location(other)
            if other_home and haversine_distance(home[0], home[1], other_home[0], other_home[1]) < 200:
                nearby_homes += 1
        if nearby_homes == 0:
            patterns.append(f"Unique home location ({round(home[0], 4)}, {round(home[1], 4)})")
        elif nearby_homes < 3:
            patterns.append(f"Rare home area (only {nearby_homes + 1} users)")
    

    work = infer_work_location(user)
    if work:
        nearby_works = 0
        for other in all_users:
            if other.user_id == user.user_id:
                continue
            other_work = infer_work_location(other)
            if other_work and haversine_distance(work[0], work[1], other_work[0], other_work[1]) < 300:
                nearby_works += 1
        if nearby_works == 0:
            patterns.append(f"Unique work location ({round(work[0], 4)}, {round(work[1], 4)})")
    

    user_sig = calculate_trajectory_signature(user)
    matching_sigs = sum(1 for u in all_users if calculate_trajectory_signature(u) == user_sig)
    if matching_sigs == 1:
        patterns.append("Unique trajectory signature")
    
    return patterns


def calculate_min_points_to_identify(user: UserProfile, all_users: List[UserProfile]) -> int:

    all_locations = sorted(user.locations, key=lambda p: p.timestamp)
    
    for n in range(1, min(len(all_locations), 10) + 1):

        subset = all_locations[:n]
        

        matching_users = 0
        for other in all_users:
            other_locs = sorted(other.locations, key=lambda p: p.timestamp)
            
            matches_all = True
            for point in subset:
                matched_point = False
                for other_point in other_locs:

                    dist = haversine_distance(point.lat, point.lon, other_point.lat, other_point.lon)
                    time_diff = abs((point.timestamp - other_point.timestamp).total_seconds()) / 60
                    if dist < 200 and time_diff < 30:
                        matched_point = True
                        break
                if not matched_point:
                    matches_all = False
                    break
            
            if matches_all:
                matching_users += 1
        
        if matching_users == 1:
            return n
    
    return 10



def calculate_user_risk(user: UserProfile, all_users: List[UserProfile]) -> RiskScore:

    home = infer_home_location(user)
    work = infer_work_location(user)
    unique_patterns = identify_unique_patterns(user, all_users)
    min_points = calculate_min_points_to_identify(user, all_users)
    



    uniqueness = min(100, len(unique_patterns) * 20 + (10 - min_points) * 10)
    


    base_prob = 20
    if home:
        base_prob += 30
    if work:
        base_prob += 25
    base_prob += len(unique_patterns) * 10
    base_prob = min(100, base_prob - (min_points - 1) * 5)
    

    overall = (uniqueness + max(0, base_prob)) / 2
    
    return RiskScore(
        overall_risk=round(overall, 1),
        uniqueness_score=round(uniqueness, 1),
        reidentification_probability=round(max(0, base_prob), 1),
        home_inferred=home is not None,
        work_inferred=work is not None,
        unique_patterns=unique_patterns,
        min_points_to_identify=min_points
    )


def calculate_dataset_risk(dataset: Dataset) -> Dict[str, RiskScore]:

    return {
        user.user_id: calculate_user_risk(user, dataset.users)
        for user in dataset.users
    }


def identify_user_patterns(user: UserProfile, all_users: List[UserProfile]) -> PatternResult:

    home = infer_home_location(user)
    work = infer_work_location(user)
    unique_patterns = identify_unique_patterns(user, all_users)
    

    clusters = cluster_locations(user.locations, eps_meters=200)
    frequent_locs = []
    for cluster in sorted(clusters, key=len, reverse=True)[:5]:
        avg_lat = np.mean([p.lat for p in cluster])
        avg_lon = np.mean([p.lon for p in cluster])
        frequent_locs.append(LocationPoint(
            lat=avg_lat,
            lon=avg_lon,
            timestamp=cluster[0].timestamp,
            location_type="frequent"
        ))
    

    risk_factors = []
    if home:
        risk_factors.append("Home location can be inferred from night patterns")
    if work:
        risk_factors.append("Work location can be inferred from weekday patterns")
    if len(user.locations) > 100:
        risk_factors.append("Large location history increases identification risk")
    
    return PatternResult(
        user_id=user.user_id,
        home_location=LocationPoint(lat=home[0], lon=home[1], timestamp=user.locations[0].timestamp, location_type="home") if home else None,
        work_location=LocationPoint(lat=work[0], lon=work[1], timestamp=user.locations[0].timestamp, location_type="work") if work else None,
        frequent_locations=frequent_locs,
        unique_trajectories=unique_patterns,
        risk_factors=risk_factors
    )
