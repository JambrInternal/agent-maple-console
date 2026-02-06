// Core Types for Agent Maple Console API

// ============================================
// Enums
// ============================================

export type AgentStatus = 'online' | 'offline';
export type ThreadStatus = 'open' | 'needs_response' | 'waiting' | 'done';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';
export type Channel = 'voice' | 'sms' | 'email';
export type MessageDirection = 'inbound' | 'outbound';
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';
export type KnowledgeSourceType = 'pdf' | 'doc' | 'google_drive' | 'dropbox';
export type KnowledgeSourceStatus = 'pending' | 'indexing' | 'ready' | 'error';

// ============================================
// Core Entities
// ============================================

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    mfaEnabled: boolean;
    createdAt: string;
}

export interface Organization {
    id: string;
    name: string;
    projectCount: number;
    memberCount?: number;
    plan?: 'starter' | 'professional' | 'enterprise';
    createdAt: string;
}

export interface Project {
    id: string;
    organizationId: string;
    name: string;
    agentStatus: AgentStatus;
    threadCount: number;
    issueCount: number;
    lastActivityAt: string;
    createdAt: string;
}

export interface Thread {
    id: string;
    projectId: string;
    contactId: string;
    issueId: string;
    status: ThreadStatus;
    subject: string;
    lastMessageAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface ThreadWithDetails extends Thread {
    contact: Contact;
    issue: Issue;
}

export interface Issue {
    id: string;
    projectId: string;
    title: string;
    description: string;
    status: IssueStatus;
    ownerId: string | null;
    threadCount: number;
    firstOccurrenceAt: string;
    lastOccurrenceAt: string;
    resolvedAt: string | null;
    createdAt: string;
}

export interface IssueWithThreads extends Issue {
    threads: Thread[];
    owner: User | null;
}

export interface Contact {
    id: string;
    projectId: string;
    name: string;
    phone: string;
    email: string;
    company?: string;
    createdAt: string;
}

export interface Message {
    id: string;
    threadId: string;
    channel: Channel;
    direction: MessageDirection;
    content: string;
    timestamp: string;
    duration?: number; // For voice calls, in seconds
}

export interface KnowledgeSource {
    id: string;
    projectId: string;
    name: string;
    type: KnowledgeSourceType;
    status: KnowledgeSourceStatus;
    documentCount: number;
    lastSyncAt: string | null;
    createdAt: string;
}

export interface ToolSkill {
    id: string;
    projectId: string;
    type: 'skill' | 'tool' | 'mcp';
    name: string;
    description: string;
    isEnabled: boolean;
    configuration: Record<string, any>;
    createdAt: string;
}

// ============================================
// Insights / Metrics
// ============================================

export interface InsightMetrics {
    totalThreads: number;
    openIssues: number;
    avgResolutionTimeHours: number;
    autoResolvedPercent: number;
    threadTrend: TrendPoint[];
    channelBreakdown: ChannelBreakdown;
    topIssues: IssueMetric[];
}

export interface TrendPoint {
    date: string;
    value: number;
}

export interface ChannelBreakdown {
    voice: number;
    sms: number;
    email: number;
}

export interface IssueMetric {
    issue: Issue;
    threadCount: number;
    lastActivityAt: string;
}

// ============================================
// API Request/Response Types
// ============================================

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ThreadFilters {
    status?: ThreadStatus;
    issueId?: string;
    contactId?: string;
}

export interface DateRange {
    start: string;
    end: string;
}

export interface CreateIssueRequest {
    projectId: string;
    title: string;
    description: string;
}

export interface UpdateThreadRequest {
    status?: ThreadStatus;
    issueId?: string;
}

export interface UpdateIssueRequest {
    status?: IssueStatus;
    ownerId?: string | null;
    title?: string;
    description?: string;
}

export interface CreateContactRequest {
    projectId: string;
    name: string;
    phone: string;
    email: string;
    company?: string;
}

export interface UpdateContactRequest {
    name?: string;
    phone?: string;
    email?: string;
    company?: string;
}
