// Contacts Service
import { mockFetch } from '../api/client';
import type { Contact, CreateContactRequest, UpdateContactRequest } from '../api/types';
import { mockContacts, getMockContact, getMockContactsByProject } from '../mocks/contacts';

/**
 * Get all contacts for a project
 */
export async function getContacts(projectId: string): Promise<Contact[]> {
    const contacts = getMockContactsByProject(projectId);
    return mockFetch(contacts);
}

/**
 * Get a single contact by ID
 */
export async function getContact(id: string): Promise<Contact> {
    const contact = getMockContact(id);
    if (!contact) {
        throw new Error(`Contact not found: ${id}`);
    }
    return mockFetch(contact);
}

/**
 * Create a new contact
 */
export async function createContact(data: CreateContactRequest): Promise<Contact> {
    const newContact: Contact = {
        id: `contact_${Date.now()}`,
        projectId: data.projectId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        company: data.company,
        escalationTier: data.escalationTier,
        threadCount: 0,
        isBlocked: false,
        createdAt: new Date().toISOString(),
    };

    return mockFetch(newContact);
}

/**
 * Update a contact
 */
export async function updateContact(
    id: string,
    data: UpdateContactRequest
): Promise<Contact> {
    const contact = getMockContact(id);
    if (!contact) {
        throw new Error(`Contact not found: ${id}`);
    }

    const updated: Contact = {
        ...contact,
        ...data,
    };

    return mockFetch(updated);
}


