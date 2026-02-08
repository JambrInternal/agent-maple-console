import { describe, expect, it } from 'vitest';
import {
    mapDatasourceResponse,
    mapIssueResponse,
    mapProjectResponse,
    mapTenantUserToContact,
    unwrapData,
} from '../mappers';

describe('api mappers', () => {
    it('unwraps generic responses with fallback', () => {
        expect(unwrapData({ data: null }, [])).toEqual([]);
    });

    it('maps project agent status from nested agent', () => {
        const project = mapProjectResponse({
            id: 'proj_1',
            tenant_id: 12,
            name: 'Site A',
            agent: { status: 'online' },
            thread_count: 3,
            issue_count: 1,
            last_activity_at: '2026-02-01T10:00:00Z',
            created_at: '2026-01-01T10:00:00Z',
        });

        expect(project.agentStatus).toBe('online');
        expect(project.threadCount).toBe(3);
        expect(project.organizationId).toBe('12');
    });

    it('maps issue status including in_progress', () => {
        const issue = mapIssueResponse({
            id: 'issue_1',
            project_id: 'proj_1',
            title: 'QA Followup',
            status: 'in_progress',
            created_at: '2026-02-02T10:00:00Z',
        });

        expect(issue.status).toBe('in_progress');
    });

    it('maps tenant user to contact', () => {
        const contact = mapTenantUserToContact({
            tenant_id: 12,
            user_id: 'user_9',
            given_name: 'Jamie',
            family_name: 'Ng',
            email: 'jamie@example.com',
            phone_number: '+1-555-0100',
            created_at: '2026-02-03T10:00:00Z',
        });

        expect(contact.projectId).toBe('12');
        expect(contact.name).toBe('Jamie Ng');
        expect(contact.email).toBe('jamie@example.com');
    });

    it('maps datasource embedding status to knowledge status', () => {
        const source = mapDatasourceResponse({
            id: 5,
            tenant_id: 2,
            file_name: 'Specs.pdf',
            content_type: 'application/pdf',
            source: 'upload',
            embedding_status: 'COMPLETED',
            created_at: '2026-02-02T10:00:00Z',
            updated_at: '2026-02-02T10:10:00Z',
        });

        expect(source.status).toBe('ready');
        expect(source.type).toBe('pdf');
    });
});
