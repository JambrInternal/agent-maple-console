// Mock Insights Data
import type { InsightMetrics } from '../api/types';
import { mockIssues } from './issues';

export const mockInsights: Record<string, InsightMetrics> = {
    proj_1: {
        totalThreads: 1247,
        openIssues: 23,
        avgResolutionTimeHours: 4.2,
        autoResolvedPercent: 89,
        threadTrend: [
            { date: '2026-01-29', value: 35 },
            { date: '2026-01-30', value: 42 },
            { date: '2026-01-31', value: 28 },
            { date: '2026-02-01', value: 45 },
            { date: '2026-02-02', value: 52 },
            { date: '2026-02-03', value: 48 },
            { date: '2026-02-04', value: 55 },
        ],
        channelBreakdown: {
            voice: 498,
            sms: 374,
            email: 375,
        },
        topIssues: [
            {
                issue: mockIssues[0], // Missing L3 Wiring
                threadCount: 47,
                lastActivityAt: '2026-02-04T08:30:00Z',
            },
            {
                issue: mockIssues[1], // Gate Access
                threadCount: 32,
                lastActivityAt: '2026-02-03T14:00:00Z',
            },
        ],
    },
    proj_4: {
        totalThreads: 850,
        openIssues: 12,
        avgResolutionTimeHours: 5.1,
        autoResolvedPercent: 82,
        threadTrend: [
            { date: '2026-01-29', value: 20 },
            { date: '2026-01-30', value: 25 },
            { date: '2026-01-31', value: 18 },
            { date: '2026-02-01', value: 22 },
            { date: '2026-02-02', value: 30 },
            { date: '2026-02-03', value: 28 },
            { date: '2026-02-04', value: 35 },
        ],
        channelBreakdown: {
            voice: 320,
            sms: 280,
            email: 250,
        },
        topIssues: [
            {
                issue: mockIssues[5], // Steel Beam Specs
                threadCount: 28,
                lastActivityAt: '2026-02-04T09:00:00Z',
            },
        ],
    },
};

export function getMockInsightsByProject(projectId: string): InsightMetrics | undefined {
    return mockInsights[projectId];
}
