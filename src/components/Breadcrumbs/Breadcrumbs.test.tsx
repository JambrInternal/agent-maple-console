import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import { getOrganization } from '../../services/organizations';
import { getProject } from '../../services/projects';

vi.mock('../../services/organizations', () => ({
  getOrganization: vi.fn(),
}));

vi.mock('../../services/projects', () => ({
  getProject: vi.fn(),
}));

const renderWithRoute = (initialEntry) => {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/:orgId/projects" element={<Breadcrumbs />} />
        <Route path="/:orgId/:projId/threads" element={<Breadcrumbs />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Breadcrumbs', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows organization only for org-level routes', async () => {
    vi.mocked(getOrganization).mockResolvedValue({
      id: 'iron_maple',
      name: 'Iron Maple',
      projectCount: 0,
      createdAt: '2026-02-01T00:00:00Z',
    });

    renderWithRoute('/iron_maple/projects');

    expect(await screen.findByText('Iron Maple')).toBeInTheDocument();
    expect(screen.queryByText('Projects')).not.toBeInTheDocument();
  });

  it('shows project context and Threads for threads', async () => {
    vi.mocked(getOrganization).mockResolvedValue({
      id: 'iron_maple',
      name: 'Iron Maple',
      projectCount: 1,
      createdAt: '2026-02-01T00:00:00Z',
    });
    vi.mocked(getProject).mockResolvedValue({
      id: 'alpha_site',
      organizationId: 'iron_maple',
      name: 'Alpha Site',
      agentStatus: 'online',
      threadCount: 0,
      issueCount: 0,
      lastActivityAt: '2026-02-01T00:00:00Z',
      createdAt: '2026-02-01T00:00:00Z',
    });

    renderWithRoute('/iron_maple/alpha_site/threads');

    expect(await screen.findByText('Iron Maple')).toBeInTheDocument();
    expect(await screen.findByText('Alpha Site')).toBeInTheDocument();
    expect(screen.getByText('Threads')).toBeInTheDocument();
  });
});
