

export interface LocationPoint {
    lat: number;
    lon: number;
    timestamp: string;
    location_type?: 'home' | 'work' | 'leisure' | 'transit' | 'frequent';
}

export interface UserProfile {
    user_id: string;
    locations: LocationPoint[];
    home_location?: LocationPoint;
    work_location?: LocationPoint;
}

export interface Dataset {
    users: UserProfile[];
    generated_at: string;
    city: string;
}

export interface RiskScore {
    overall_risk: number;
    uniqueness_score: number;
    reidentification_probability: number;
    home_inferred: boolean;
    work_inferred: boolean;
    unique_patterns: string[];
    min_points_to_identify: number;
}

export interface AnonymizedDataset {
    dataset: Dataset;
    technique: string;
    parameters: Record<string, number | string>;
    utility_loss: number;
    new_risk_score: RiskScore;
}

export interface ComparisonResult {
    original_risk: RiskScore;
    anonymized_risk: RiskScore;
    risk_reduction: number;
    utility_loss: number;
    technique_used: string;
    parameters: Record<string, number | string>;
}

export interface PatternResult {
    user_id: string;
    home_location?: LocationPoint;
    work_location?: LocationPoint;
    frequent_locations: LocationPoint[];
    unique_trajectories: string[];
    risk_factors: string[];
}


export type PrivacyTechnique = 'k-anonymity' | 'spatial-cloaking' | 'differential-privacy';

export interface PrivacyParameters {
    'k-anonymity': { k: number };
    'spatial-cloaking': { radius_meters: number };
    'differential-privacy': { epsilon: number };
}


export type RiskLevel = 'low' | 'medium' | 'high';

export function getRiskLevel(risk: number): RiskLevel {
    if (risk < 40) return 'low';
    if (risk < 70) return 'medium';
    return 'high';
}

export function getRiskColor(risk: number): string {
    if (risk < 40) return '#22c55e';
    if (risk < 70) return '#eab308';
    return '#ef4444';
}
