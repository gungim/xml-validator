'use client'

import Link from 'next/link'
import { Loading } from '../../components/loading'
import { useProjects } from '../../lib/hooks/projects'
import { usePermissions } from '../../lib/hooks/users'
import { CreateProjectDialog } from './create-project-dialog'

interface ProjectListProps {
  workspace_id: string
}
export default function ProjectList({ workspace_id }: ProjectListProps) {
  const { data: projects, isLoading } = useProjects(workspace_id)
  const { canEdit } = usePermissions(workspace_id)

  if (isLoading) {
    return <Loading />
  }
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap">
        <h2 className="text-xl font-semibold">Projects</h2>
        {canEdit && <CreateProjectDialog workspaceId={workspace_id} />}
      </div>

      {!projects?.data || projects.data.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No projects yet. Create your first project!
        </p>
      ) : (
        <ul className="divide-y">
          {projects.data.map(project => (
            <li key={project.id} className="px-4 py-2">
              <Link href={`/workspaces/${workspace_id}/projects/${project.id}`}>
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-600">
                      {project.description}
                    </p>
                  )}
                </div>
              </Link>
              <p className="text-xs text-muted-foreground">
                Endpoint: <code>/api/validate/{project.endpointSlug}</code>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
