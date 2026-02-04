// Mock Contacts Data
import type { Contact } from '../api/types';

export const mockContacts: Contact[] = [
    // Site-A Plaza contacts
    {
        id: 'contact_1',
        projectId: 'proj_1',
        name: 'Dave Morrison',
        phone: '+1-416-555-0101',
        email: 'dave.morrison@subcontractor.com',
        company: 'Morrison Electric',
        escalationTier: 1,
        threadCount: 4,
        isBlocked: false,
        createdAt: '2024-07-15T10:00:00Z',
    },
    {
        id: 'contact_2',
        projectId: 'proj_1',
        name: 'Lisa Park',
        phone: '+1-416-555-0102',
        email: 'lisa.park@cityinspections.gov',
        company: 'City Inspections',
        escalationTier: 2,
        threadCount: 3,
        isBlocked: false,
        createdAt: '2024-07-20T09:00:00Z',
    },
    {
        id: 'contact_3',
        projectId: 'proj_1',
        name: 'Carlos Mendez',
        phone: '+1-416-555-0103',
        email: 'carlos@mendezplumbing.ca',
        company: 'Mendez Plumbing',
        escalationTier: 1,
        threadCount: 2,
        isBlocked: false,
        createdAt: '2024-08-01T11:00:00Z',
    },
    {
        id: 'contact_4',
        projectId: 'proj_1',
        name: 'Rachel Kim',
        phone: '+1-416-555-0104',
        email: 'rkim@architectfirm.com',
        company: 'Kim & Associates',
        escalationTier: 3,
        threadCount: 3,
        isBlocked: false,
        createdAt: '2024-08-10T14:00:00Z',
    },
    // Site-B Warehouse contacts
    {
        id: 'contact_5',
        projectId: 'proj_2',
        name: 'James O\'Brien',
        phone: '+1-905-555-0201',
        email: 'jobrien@hvacpro.com',
        company: 'HVAC Pro Services',
        escalationTier: 1,
        threadCount: 5,
        isBlocked: false,
        createdAt: '2024-08-20T10:00:00Z',
    },
    {
        id: 'contact_6',
        projectId: 'proj_2',
        name: 'Maria Santos',
        phone: '+1-905-555-0202',
        email: 'maria@roofingexperts.com',
        company: 'Expert Roofing',
        escalationTier: 2,
        threadCount: 3,
        isBlocked: false,
        createdAt: '2024-09-01T09:00:00Z',
    },
    // North Campus contacts
    {
        id: 'contact_7',
        projectId: 'proj_4',
        name: 'Kevin Tran',
        phone: '+1-647-555-0301',
        email: 'ktran@steelworks.ca',
        company: 'Tran Steel Works',
        escalationTier: 1,
        threadCount: 6,
        isBlocked: false,
        createdAt: '2024-11-10T10:00:00Z',
    },
    {
        id: 'contact_8',
        projectId: 'proj_4',
        name: 'Amanda Wright',
        phone: '+1-647-555-0302',
        email: 'awright@securitysystems.com',
        company: 'Wright Security',
        escalationTier: 2,
        threadCount: 4,
        isBlocked: false,
        createdAt: '2024-11-15T11:00:00Z',
    },
];

export function getMockContact(id: string): Contact | undefined {
    return mockContacts.find((contact) => contact.id === id);
}

export function getMockContactsByProject(projectId: string): Contact[] {
    return mockContacts.filter((contact) => contact.projectId === projectId);
}
