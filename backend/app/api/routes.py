
from typing import Dict, Any
from copy import deepcopy
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    Dataset, RiskScore, AnonymizedDataset, ComparisonResult,
    KAnonymityRequest, SpatialCloakingRequest, DifferentialPrivacyRequest,
    PatternResult
)
from app.services.dataset_generator import generate_dataset
from app.services.risk_calculator import (
    calculate_user_risk, calculate_dataset_risk, identify_user_patterns
)
from app.core.privacy_algorithms import (
    apply_k_anonymity, apply_spatial_cloaking, apply_differential_privacy,
    compare_coordinates
)

router = APIRouter()


_cached_dataset: Dataset | None = None


@router.get("/generate-dataset", response_model=Dataset)
async def generate_dataset_endpoint(num_users: int | None = None, refresh: bool = False):

    global _cached_dataset
    
    if _cached_dataset is None or refresh or num_users:
        _cached_dataset = generate_dataset(num_users)
    
    return _cached_dataset


@router.post("/calculate-risk")
async def calculate_risk_endpoint(dataset: Dataset) -> Dict[str, RiskScore]:

    return calculate_dataset_risk(dataset)


@router.post("/calculate-risk/{user_id}")
async def calculate_user_risk_endpoint(user_id: str, dataset: Dataset) -> RiskScore:

    user = next((u for u in dataset.users if u.user_id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    return calculate_user_risk(user, dataset.users)


@router.post("/anonymize/k-anonymity", response_model=AnonymizedDataset)
async def apply_k_anonymity_endpoint(request: KAnonymityRequest) -> AnonymizedDataset:

    anonymized, utility_loss = apply_k_anonymity(request.dataset, request.k)
    

    risks = calculate_dataset_risk(anonymized)

    avg_risk = RiskScore(
        overall_risk=sum(r.overall_risk for r in risks.values()) / len(risks),
        uniqueness_score=sum(r.uniqueness_score for r in risks.values()) / len(risks),
        reidentification_probability=sum(r.reidentification_probability for r in risks.values()) / len(risks),
        home_inferred=any(r.home_inferred for r in risks.values()),
        work_inferred=any(r.work_inferred for r in risks.values()),
        unique_patterns=[],
        min_points_to_identify=max(r.min_points_to_identify for r in risks.values())
    )
    
    return AnonymizedDataset(
        dataset=anonymized,
        technique="k-anonymity",
        parameters={"k": request.k},
        utility_loss=utility_loss,
        new_risk_score=avg_risk
    )


@router.post("/anonymize/spatial-cloaking", response_model=AnonymizedDataset)
async def apply_spatial_cloaking_endpoint(request: SpatialCloakingRequest) -> AnonymizedDataset:

    anonymized, utility_loss = apply_spatial_cloaking(request.dataset, request.radius_meters)
    
    risks = calculate_dataset_risk(anonymized)
    avg_risk = RiskScore(
        overall_risk=sum(r.overall_risk for r in risks.values()) / len(risks),
        uniqueness_score=sum(r.uniqueness_score for r in risks.values()) / len(risks),
        reidentification_probability=sum(r.reidentification_probability for r in risks.values()) / len(risks),
        home_inferred=any(r.home_inferred for r in risks.values()),
        work_inferred=any(r.work_inferred for r in risks.values()),
        unique_patterns=[],
        min_points_to_identify=max(r.min_points_to_identify for r in risks.values())
    )
    
    return AnonymizedDataset(
        dataset=anonymized,
        technique="spatial-cloaking",
        parameters={"radius_meters": request.radius_meters},
        utility_loss=utility_loss,
        new_risk_score=avg_risk
    )


@router.post("/anonymize/differential-privacy", response_model=AnonymizedDataset)
async def apply_differential_privacy_endpoint(request: DifferentialPrivacyRequest) -> AnonymizedDataset:

    anonymized, utility_loss = apply_differential_privacy(request.dataset, request.epsilon)
    
    risks = calculate_dataset_risk(anonymized)
    avg_risk = RiskScore(
        overall_risk=sum(r.overall_risk for r in risks.values()) / len(risks),
        uniqueness_score=sum(r.uniqueness_score for r in risks.values()) / len(risks),
        reidentification_probability=sum(r.reidentification_probability for r in risks.values()) / len(risks),
        home_inferred=any(r.home_inferred for r in risks.values()),
        work_inferred=any(r.work_inferred for r in risks.values()),
        unique_patterns=[],
        min_points_to_identify=max(r.min_points_to_identify for r in risks.values())
    )
    
    return AnonymizedDataset(
        dataset=anonymized,
        technique="differential-privacy",
        parameters={"epsilon": request.epsilon},
        utility_loss=utility_loss,
        new_risk_score=avg_risk
    )


@router.post("/identify-patterns/{user_id}", response_model=PatternResult)
async def identify_patterns_endpoint(user_id: str, dataset: Dataset) -> PatternResult:

    user = next((u for u in dataset.users if u.user_id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    return identify_user_patterns(user, dataset.users)


@router.post("/compare-privacy", response_model=ComparisonResult)
async def compare_privacy_endpoint(
    technique: str,
    original_dataset: Dataset,
    anonymized_dataset: Dataset,
    parameters: Dict[str, Any]
) -> ComparisonResult:


    orig_risks = calculate_dataset_risk(original_dataset)
    orig_avg = RiskScore(
        overall_risk=sum(r.overall_risk for r in orig_risks.values()) / len(orig_risks),
        uniqueness_score=sum(r.uniqueness_score for r in orig_risks.values()) / len(orig_risks),
        reidentification_probability=sum(r.reidentification_probability for r in orig_risks.values()) / len(orig_risks),
        home_inferred=any(r.home_inferred for r in orig_risks.values()),
        work_inferred=any(r.work_inferred for r in orig_risks.values()),
        unique_patterns=[],
        min_points_to_identify=min(r.min_points_to_identify for r in orig_risks.values())
    )
    

    anon_risks = calculate_dataset_risk(anonymized_dataset)
    anon_avg = RiskScore(
        overall_risk=sum(r.overall_risk for r in anon_risks.values()) / len(anon_risks),
        uniqueness_score=sum(r.uniqueness_score for r in anon_risks.values()) / len(anon_risks),
        reidentification_probability=sum(r.reidentification_probability for r in anon_risks.values()) / len(anon_risks),
        home_inferred=any(r.home_inferred for r in anon_risks.values()),
        work_inferred=any(r.work_inferred for r in anon_risks.values()),
        unique_patterns=[],
        min_points_to_identify=min(r.min_points_to_identify for r in anon_risks.values())
    )
    

    distortion = compare_coordinates(original_dataset, anonymized_dataset)
    
    return ComparisonResult(
        original_risk=orig_avg,
        anonymized_risk=anon_avg,
        risk_reduction=orig_avg.overall_risk - anon_avg.overall_risk,
        utility_loss=min(100, distortion.get("avg_distortion_meters", 0) / 10),
        technique_used=technique,
        parameters=parameters
    )
