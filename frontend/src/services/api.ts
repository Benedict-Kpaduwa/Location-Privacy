
import axios from 'axios';
import type {
    Dataset,
    RiskScore,
    AnonymizedDataset,
    PatternResult,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


export async function generateDataset(
    numUsers?: number,
    refresh?: boolean
): Promise<Dataset> {
    const params = new URLSearchParams();
    if (numUsers) params.append('num_users', numUsers.toString());
    if (refresh) params.append('refresh', 'true');

    const response = await api.get<Dataset>(`/generate-dataset?${params}`);
    return response.data;
}


export async function calculateRisk(
    dataset: Dataset
): Promise<Record<string, RiskScore>> {
    const response = await api.post<Record<string, RiskScore>>('/calculate-risk', dataset);
    return response.data;
}


export async function calculateUserRisk(
    userId: string,
    dataset: Dataset
): Promise<RiskScore> {
    const response = await api.post<RiskScore>(`/calculate-risk/${userId}`, dataset);
    return response.data;
}


export async function applyKAnonymity(
    dataset: Dataset,
    k: number
): Promise<AnonymizedDataset> {
    const response = await api.post<AnonymizedDataset>('/anonymize/k-anonymity', {
        dataset,
        k,
    });
    return response.data;
}


export async function applySpatialCloaking(
    dataset: Dataset,
    radiusMeters: number
): Promise<AnonymizedDataset> {
    const response = await api.post<AnonymizedDataset>('/anonymize/spatial-cloaking', {
        dataset,
        radius_meters: radiusMeters,
    });
    return response.data;
}


export async function applyDifferentialPrivacy(
    dataset: Dataset,
    epsilon: number
): Promise<AnonymizedDataset> {
    const response = await api.post<AnonymizedDataset>('/anonymize/differential-privacy', {
        dataset,
        epsilon,
    });
    return response.data;
}


export async function identifyPatterns(
    userId: string,
    dataset: Dataset
): Promise<PatternResult> {
    const response = await api.post<PatternResult>(`/identify-patterns/${userId}`, dataset);
    return response.data;
}


export async function healthCheck(): Promise<{ status: string }> {
    const response = await api.get<{ status: string }>('/health');
    return response.data;
}
