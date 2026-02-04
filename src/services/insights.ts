// Insights Service
import { mockFetch } from '../api/client';
import type { InsightMetrics } from '../api/types';
import { getMockInsightsByProject } from '../mocks/insights';

/**
 * Get aggregated insights and reporting metrics for a project
 */
export async function getInsights(
    projectId: string,
    range: '7d' | '30d' | '90d' = '30d'
): Promise<InsightMetrics> {
    const insights = getMockInsightsByProject(projectId);
    if (!insights) {
        throw new Error(`Insights not found for project: ${projectId}`);
    }

    // In a real app, we might filter or modify based on the range
    return mockFetch(insights);
}
