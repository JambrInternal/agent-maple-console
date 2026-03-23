// Insights Service
import type { InsightMetrics } from '../api/types';

/**
 * Get aggregated insights and reporting metrics for a project
 */
export async function getInsights(
  projectId: string,
  range: '7d' | '30d' | '90d' = '30d'
): Promise<InsightMetrics> {
  throw new Error(`Insights are not available yet (project ${projectId}, range ${range}).`);
}
