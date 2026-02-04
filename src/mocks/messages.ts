// Mock Messages Data
import type { Message } from '../api/types';

export const mockMessages: Message[] = [
    // Thread 1: Dave Morrison - L3 wiring specs
    {
        id: 'msg_1',
        threadId: 'thread_1',
        channel: 'voice',
        direction: 'inbound',
        content: 'Hi, this is Dave from Morrison Electric. I need the L3 wiring specs for the panel installation we\'re doing tomorrow. Can you send those over?',
        timestamp: '2026-01-15T09:00:00Z',
        duration: 45,
    },
    {
        id: 'msg_2',
        threadId: 'thread_1',
        channel: 'voice',
        direction: 'outbound',
        content: 'Hi Dave, I understand you need the Level 3 wiring specifications. I\'m checking with the project team to locate those documents. Can I reach you at this number when I have them?',
        timestamp: '2026-01-15T09:01:00Z',
        duration: 30,
    },
    {
        id: 'msg_3',
        threadId: 'thread_1',
        channel: 'sms',
        direction: 'inbound',
        content: 'Hey its Dave. Any update on those L3 specs?',
        timestamp: '2026-02-04T08:30:00Z',
    },
    // Thread 7: Lisa Park - Inspection requires docs
    {
        id: 'msg_10',
        threadId: 'thread_7',
        channel: 'email',
        direction: 'inbound',
        content: 'Good morning,\n\nThis is Lisa Park from City Inspections. Our upcoming inspection of Site-A Plaza will require verification of the Level 3 electrical wiring documentation. Please ensure these documents are available on-site by February 10th.\n\nBest regards,\nLisa Park\nCity Inspections',
        timestamp: '2026-02-03T10:00:00Z',
    },
    {
        id: 'msg_11',
        threadId: 'thread_7',
        channel: 'email',
        direction: 'outbound',
        content: 'Hi Lisa,\n\nThank you for the reminder. We are currently working on obtaining the L3 wiring documentation and will have it ready for your inspection. I\'ll confirm availability before the 10th.\n\nBest regards,\nAgent Maple',
        timestamp: '2026-02-03T10:15:00Z',
    },
    // Thread 8: HVAC unit placement
    {
        id: 'msg_12',
        threadId: 'thread_8',
        channel: 'voice',
        direction: 'inbound',
        content: 'This is James from HVAC Pro. The drawings show the main unit on the east wall but there\'s a structural column there. Can we move it 6 feet north?',
        timestamp: '2026-01-28T11:00:00Z',
        duration: 120,
    },
    {
        id: 'msg_13',
        threadId: 'thread_8',
        channel: 'voice',
        direction: 'outbound',
        content: 'Hi James, I\'ve noted your request about relocating the HVAC unit due to the structural column. I\'ll need to check with the project engineer on the feasibility. Can I call you back this afternoon?',
        timestamp: '2026-01-28T11:02:00Z',
        duration: 45,
    },
    {
        id: 'msg_14',
        threadId: 'thread_8',
        channel: 'voice',
        direction: 'inbound',
        content: 'Hey, just following up on the HVAC placement question from last week. My crew is ready to install but we need confirmation.',
        timestamp: '2026-02-04T07:00:00Z',
        duration: 35,
    },
    // Thread 11: Steel beam load calculations
    {
        id: 'msg_20',
        threadId: 'thread_11',
        channel: 'email',
        direction: 'inbound',
        content: 'Hello,\n\nKevin Tran here from Tran Steel Works. We need the load-bearing calculations for the custom steel beams in Section C. Our fabrication schedule requires these by end of week.\n\nThanks,\nKevin',
        timestamp: '2026-01-25T10:00:00Z',
    },
    {
        id: 'msg_21',
        threadId: 'thread_11',
        channel: 'email',
        direction: 'outbound',
        content: 'Hi Kevin,\n\nThank you for reaching out. I\'ve forwarded your request to our structural engineering team. They typically respond within 24-48 hours for calculation requests.\n\nI\'ll follow up to ensure this is prioritized given your fabrication timeline.\n\nBest,\nAgent Maple',
        timestamp: '2026-01-25T10:30:00Z',
    },
    {
        id: 'msg_22',
        threadId: 'thread_11',
        channel: 'email',
        direction: 'inbound',
        content: 'Just checking in - still waiting on those calculations. Can you provide an update?',
        timestamp: '2026-02-04T09:00:00Z',
    },
];

export function getMockMessage(id: string): Message | undefined {
    return mockMessages.find((msg) => msg.id === id);
}

export function getMockMessagesByThread(threadId: string): Message[] {
    return mockMessages.filter((msg) => msg.threadId === threadId);
}
