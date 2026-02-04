import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Breadcrumbs from '../Breadcrumbs';

const renderWithRoute = (initialEntry) => {
    render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/:orgId/projects" element={<Breadcrumbs />} />
                <Route path="/:orgId/:projId/triage" element={<Breadcrumbs />} />
            </Routes>
        </MemoryRouter>
    );
};

describe('Breadcrumbs', () => {
    it('shows organization and view label for org-level routes', () => {
        renderWithRoute('/iron_maple/projects');
        expect(screen.getByText('Iron Maple')).toBeInTheDocument();
        expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('shows project context and Threads for triage', () => {
        renderWithRoute('/iron_maple/alpha_site/triage');
        expect(screen.getByText('Iron Maple')).toBeInTheDocument();
        expect(screen.getByText('Alpha Site')).toBeInTheDocument();
        expect(screen.getByText('Threads')).toBeInTheDocument();
    });
});
