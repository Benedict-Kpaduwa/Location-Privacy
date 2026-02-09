"""
Pydantic Models for API Request/Response
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class LocationPoint(BaseModel):
    """A single location data point"""
    lat: float = Field(..., description="Latitude")
    lon: float = Field(..., description="Longitude")
    timestamp: datetime = Field(..., description="Time of the location reading")
    location_type: Optional[str] = Field(None, description="Type: home, work, leisure, transit")


class UserProfile(BaseModel):
    """A user's location profile"""
    user_id: str = Field(..., description="Unique user identifier")
    locations: List[LocationPoint] = Field(..., description="User's location history")
    home_location: Optional[LocationPoint] = Field(None, description="Inferred home location")
    work_location: Optional[LocationPoint] = Field(None, description="Inferred work location")


class Dataset(BaseModel):
    """Full dataset of user profiles"""
    users: List[UserProfile]
    generated_at: datetime
    city: str = "Calgary"


class RiskScore(BaseModel):
    """Re-identification risk assessment"""
    overall_risk: float = Field(..., ge=0, le=100, description="Overall risk percentage")
    uniqueness_score: float = Field(..., ge=0, le=100, description="How unique the trajectory is")
    reidentification_probability: float = Field(..., ge=0, le=100)
    home_inferred: bool = Field(..., description="Whether home was successfully inferred")
    work_inferred: bool = Field(..., description="Whether work was successfully inferred")
    unique_patterns: List[str] = Field(default_factory=list, description="Identified unique patterns")
    min_points_to_identify: int = Field(..., description="Minimum points needed to identify")


class AnonymizationRequest(BaseModel):
    """Request for anonymization"""
    dataset: Dataset
    
    
class KAnonymityRequest(AnonymizationRequest):
    """Request for k-anonymity"""
    k: int = Field(5, ge=2, le=20, description="K value for k-anonymity")


class SpatialCloakingRequest(AnonymizationRequest):
    """Request for spatial cloaking"""
    radius_meters: float = Field(500, ge=50, le=5000, description="Cloaking radius in meters")


class DifferentialPrivacyRequest(AnonymizationRequest):
    """Request for differential privacy"""
    epsilon: float = Field(1.0, ge=0.01, le=10.0, description="Privacy budget epsilon")


class AnonymizedDataset(BaseModel):
    """Anonymized dataset with metadata"""
    dataset: Dataset
    technique: str
    parameters: Dict[str, Any]
    utility_loss: float = Field(..., ge=0, le=100, description="Percentage of utility lost")
    new_risk_score: RiskScore


class ComparisonResult(BaseModel):
    """Before/after privacy comparison"""
    original_risk: RiskScore
    anonymized_risk: RiskScore
    risk_reduction: float
    utility_loss: float
    technique_used: str
    parameters: Dict[str, Any]


class PatternResult(BaseModel):
    """Identified patterns for a user"""
    user_id: str
    home_location: Optional[LocationPoint]
    work_location: Optional[LocationPoint]
    frequent_locations: List[LocationPoint]
    unique_trajectories: List[str]
    risk_factors: List[str]
