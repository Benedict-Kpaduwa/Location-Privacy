
from typing import Tuple


CITY_CENTER: Tuple[float, float] = (51.0447, -114.0719)
CITY_BOUNDS = {
    "min_lat": 50.85,
    "max_lat": 51.20,
    "min_lon": -114.35,
    "max_lon": -113.85
}


NUM_USERS_MIN = 30
NUM_USERS_MAX = 50
POINTS_PER_USER_MIN = 50
POINTS_PER_USER_MAX = 150


CALGARY_LANDMARKS = {
    "downtown": (51.0447, -114.0719),
    "university": (51.0777, -114.1300),
    "airport": (51.1215, -114.0076),
    "south_health_campus": (50.8820, -113.9566),
    "chinook_centre": (50.9983, -114.0738),
    "market_mall": (51.0890, -114.1560),
    "stephen_ave": (51.0461, -114.0625),
    "saddledome": (51.0374, -114.0519),
    "calgary_tower": (51.0448, -114.0630),
    "kensington": (51.0533, -114.0900),
    "inglewood": (51.0347, -114.0254),
    "bridgeland": (51.0560, -114.0457),
    "beltline": (51.0380, -114.0700),
    "mission": (51.0300, -114.0600),
    "bowness": (51.0880, -114.1890),
    "crowfoot": (51.1234, -114.2008),
}


K_ANONYMITY_VALUES = [2, 5, 10]
SPATIAL_CLOAKING_RADII = [100, 500, 1000]
DIFFERENTIAL_PRIVACY_EPSILONS = [0.1, 0.5, 1.0, 2.0]
