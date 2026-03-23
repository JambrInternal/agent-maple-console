import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { createProject, getProjects } from '../../services/projects'
import { saveProjectPersonalityTemplate, DEFAULT_PROJECT_PERSONALITY_TEMPLATE } from '../../services/agentFacade'
import logger from '../../utils/verboseLogger'
import { useApiQuery } from '../../hooks/useApiQuery'
import QueryError from '../../components/QueryError/QueryError';
import { withStatus } from '../../utils/errors'
import CreateProjectModal from '../../features/projects/components/CreateProjectModal/CreateProjectModal'
import ProjectCard from '../../features/projects/components/ProjectCard/ProjectCard'
import { filterProjects, PROJECT_STATUS_OPTIONS } from '../../features/projects/projectsUtils'
import { Button, Input } from '../../components/ui'

const Projects = () => {
    const { orgId } = useParams()
    const navigate = useNavigate()
    const {
        data: projects = [],
        isLoading: loading,
        error,
        refetch
    } = useApiQuery(
        orgId ? ['projects', orgId] : ['projects', 'none'],
        async () => {
            if (!orgId) return [];
            // Only show projects if endpoint is supported
            return await getProjects(orgId);
        },
        { enabled: !!orgId }
    )
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [createName, setCreateName] = useState('')
    const [createError, setCreateError] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const hasProjectLimitReached = projects.length >= 1



    const openCreateModal = () => {
        if (hasProjectLimitReached) {
            logger.info('Project create blocked: tenant already has a project', { orgId });
            return;
        }
        logger.info('Opening create project modal');
        setCreateName('')
        setCreateError('')
        setIsCreateOpen(true)
    }

    const closeCreateModal = () => {
        if (isCreating) return
        logger.info('Closing create project modal');
        setIsCreateOpen(false)
    }

    const handleCreate = async (event) => {
        event.preventDefault()
        if (!orgId) {
            logger.error('No orgId present for project creation');
            return
        }
        const trimmed = createName.trim()
        if (!trimmed) {
            logger.warn('Project name is required (empty input)');
            setCreateError('Project name is required.')
            return
        }
        setCreateError('')
        setIsCreating(true)
        logger.info('Creating project', { orgId, name: trimmed })
        try {
            const project = await createProject(orgId, trimmed)
            logger.info('Project created successfully', { orgId, name: trimmed, projectId: project.id })

            try {
                await saveProjectPersonalityTemplate(
                    { organizationId: orgId, projectId: project.id },
                    DEFAULT_PROJECT_PERSONALITY_TEMPLATE
                )
                logger.info('Default personality template created for new project', { projectId: project.id })
            } catch (templateErr) {
                logger.error('Failed to create default personality template (non-blocking)', templateErr)
            }

            setIsCreateOpen(false)
            refetch()
            navigate(`/${orgId}/projects`)
        } catch (err) {
            logger.error('Failed to create project', err)
            setCreateError(withStatus('Project could not be created. Try again.', err))
        } finally {
            setIsCreating(false)
        }
    }

    const filteredProjects = useMemo(() => {
        const filtered = filterProjects({
            projects,
            searchTerm,
            statusFilter,
        })
        logger.debug('Filtered projects', { count: filtered.length, searchTerm, statusFilter })
        return filtered
    }, [projects, searchTerm, statusFilter])

    const handleOpenProject = (projectId) => {
        navigate(`/${orgId}/${projectId}/contacts`)
    }

    return (
        <div className="am-page-content">
            <div className="am-page-header">
                <div>
                    <h1 className="am-page-title">Projects</h1>
                    <p className="am-page-subtitle">Monitor agent status and site activity</p>
                </div>
                <Button
                    type="button"
                    variant="primary"
                    onClick={openCreateModal}
                    disabled={hasProjectLimitReached}
                    aria-disabled={hasProjectLimitReached}
                    title={hasProjectLimitReached ? 'Only one project is allowed per organization right now.' : undefined}
                    style={hasProjectLimitReached ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
                >
                    <Plus size={16} />
                    <span>Launch Project</span>
                </Button>
            </div>

            <div className="am-projects-toolbar">
                <div className="am-projects-search">
                    <Search size={16} className="am-text-2" />
                    <Input
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>
                <div className="am-filter-row">
                    {PROJECT_STATUS_OPTIONS.map((option) => (
                        <Button
                            key={option.key}
                            type="button"
                            variant="ghost"
                            className={`am-filter-pill ${statusFilter === option.key ? 'active' : ''}`}
                            onClick={() => setStatusFilter(option.key)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="am-text-2" style={{ padding: '2rem 0' }}>
                    Loading projects...
                </div>
            )}

            {!loading && error && (
                <div className="am-text-2" style={{ padding: '2rem 0', color: '#ef4444' }}>
                    <QueryError message="Failed to load projects." error={error} onRetry={refetch} />
                </div>
            )}

            {!loading && !error && (
                <div className="am-projects-grid">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onOpenProject={handleOpenProject}
                        />
                    ))}

                    {filteredProjects.length === 0 && (
                        <div className="am-text-2" style={{ padding: '2rem 0' }}>
                            No projects match your filters.
                        </div>
                    )}
                </div>
            )}

            <CreateProjectModal
                isOpen={isCreateOpen}
                isCreating={isCreating}
                createError={createError}
                createName={createName}
                onCreateNameChange={setCreateName}
                onClose={closeCreateModal}
                onSubmit={handleCreate}
            />
        </div>
    )
}

export default Projects
