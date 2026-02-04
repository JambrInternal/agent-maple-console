// Mock Threads Data
import type { Thread } from '../api/types';

export const mockThreads: Thread[] = [
    // Site-A Plaza threads for Issue 1 (Missing L3 Wiring Documentation)
    {
        id: 'thread_1',
        projectId: 'proj_1',
        contactId: 'contact_1',
        issueId: 'issue_1',
        status: 'open',
        subject: 'Need L3 wiring specs for panel install',
        channels: ['voice', 'sms'],
        lastMessageAt: '2026-02-04T08:30:00Z',
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-02-04T08:30:00Z',
    },
    {
        id: 'thread_2',
        projectId: 'proj_1',
        contactId: 'contact_4',
        issueId: 'issue_1',
        status: 'needs_response',
        subject: 'Requesting updated electrical drawings',
        channels: ['email'],
        lastMessageAt: '2026-02-03T16:00:00Z',
        createdAt: '2026-01-18T10:00:00Z',
        updatedAt: '2026-02-03T16:00:00Z',
    },
    {
        id: 'thread_3',
        projectId: 'proj_1',
        contactId: 'contact_1',
        issueId: 'issue_1',
        status: 'waiting',
        subject: 'Follow-up on wiring documentation',
        channels: ['sms'],
        lastMessageAt: '2026-02-02T11:00:00Z',
        createdAt: '2026-01-25T14:00:00Z',
        updatedAt: '2026-02-02T11:00:00Z',
    },
    // Site-A Plaza threads for Issue 2 (Gate Access Code Questions)
    {
        id: 'thread_4',
        projectId: 'proj_1',
        contactId: 'contact_3',
        issueId: 'issue_2',
        status: 'done',
        subject: 'Gate code for morning delivery',
        channels: ['voice'],
        lastMessageAt: '2026-02-01T07:30:00Z',
        createdAt: '2026-02-01T07:00:00Z',
        updatedAt: '2026-02-01T07:30:00Z',
    },
    {
        id: 'thread_5',
        projectId: 'proj_1',
        contactId: 'contact_1',
        issueId: 'issue_2',
        status: 'done',
        subject: 'New crew needs site access',
        channels: ['sms'],
        lastMessageAt: '2026-01-28T08:00:00Z',
        createdAt: '2026-01-28T07:45:00Z',
        updatedAt: '2026-01-28T08:00:00Z',
    },
    // Site-A Plaza threads for Issue 3 (Delivery Schedule - resolved)
    {
        id: 'thread_6',
        projectId: 'proj_1',
        contactId: 'contact_3',
        issueId: 'issue_3',
        status: 'done',
        subject: 'Concrete delivery timing',
        channels: ['voice', 'email'],
        lastMessageAt: '2026-01-25T10:00:00Z',
        createdAt: '2026-01-20T09:00:00Z',
        updatedAt: '2026-01-25T10:00:00Z',
    },
    // Site-A Plaza - Lisa Park (City Inspector) threads
    {
        id: 'thread_7',
        projectId: 'proj_1',
        contactId: 'contact_2',
        issueId: 'issue_1',
        status: 'open',
        subject: 'Inspection requires wiring documentation',
        channels: ['email'],
        lastMessageAt: '2026-02-04T08:45:00Z',
        createdAt: '2026-02-03T10:00:00Z',
        updatedAt: '2026-02-04T08:45:00Z',
    },
    // Site-B Warehouse threads
    {
        id: 'thread_8',
        projectId: 'proj_2',
        contactId: 'contact_5',
        issueId: 'issue_4',
        status: 'needs_response',
        subject: 'HVAC unit placement question',
        channels: ['voice'],
        lastMessageAt: '2026-02-04T07:00:00Z',
        createdAt: '2026-01-28T11:00:00Z',
        updatedAt: '2026-02-04T07:00:00Z',
    },
    {
        id: 'thread_9',
        projectId: 'proj_2',
        contactId: 'contact_5',
        issueId: 'issue_4',
        status: 'open',
        subject: 'Ductwork routing clarification',
        channels: ['sms', 'email'],
        lastMessageAt: '2026-02-03T15:00:00Z',
        createdAt: '2026-02-01T14:00:00Z',
        updatedAt: '2026-02-03T15:00:00Z',
    },
    {
        id: 'thread_10',
        projectId: 'proj_2',
        contactId: 'contact_6',
        issueId: 'issue_5',
        status: 'done',
        subject: 'Roof access procedure question',
        channels: ['voice'],
        lastMessageAt: '2026-01-24T15:00:00Z',
        createdAt: '2026-01-22T09:00:00Z',
        updatedAt: '2026-01-24T15:00:00Z',
    },
    // North Campus threads
    {
        id: 'thread_11',
        projectId: 'proj_4',
        contactId: 'contact_7',
        issueId: 'issue_6',
        status: 'open',
        subject: 'Load-bearing calculations needed',
        channels: ['email'],
        lastMessageAt: '2026-02-04T09:00:00Z',
        createdAt: '2026-01-25T10:00:00Z',
        updatedAt: '2026-02-04T09:00:00Z',
    },
    {
        id: 'thread_12',
        projectId: 'proj_4',
        contactId: 'contact_8',
        issueId: 'issue_7',
        status: 'waiting',
        subject: 'Security panel integration',
        channels: ['voice', 'sms'],
        lastMessageAt: '2026-02-03T16:00:00Z',
        createdAt: '2026-02-01T14:00:00Z',
        updatedAt: '2026-02-03T16:00:00Z',
    },
];

export function getMockThread(id: string): Thread | undefined {
    return mockThreads.find((thread) => thread.id === id);
}

export function getMockThreadsByProject(projectId: string): Thread[] {
    return mockThreads.filter((thread) => thread.projectId === projectId);
}

export function getMockThreadsByIssue(issueId: string): Thread[] {
    return mockThreads.filter((thread) => thread.issueId === issueId);
}

export function getMockThreadsByContact(contactId: string): Thread[] {
    return mockThreads.filter((thread) => thread.contactId === contactId);
}
