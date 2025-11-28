'use client'

import { Workspace } from '@prisma/client'
import Link from 'next/link'
import { usePermissions } from '../../lib/hooks/users'
import { DeleteWorkspaceDialog } from './delete-workspace-dialog'
import { EditWorkspaceDialog } from './edit-workspace-dialog'

interface WorkspaceListProps {
  workspaces: Workspace[]
  onRefetch: () => void
}

function WorkspaceItem({ workspace }: { workspace: Workspace }) {
  const { canEdit, canDelete } = usePermissions(workspace.id)

  return (
    <li className="flex justify-between items-center px-4 py-2">
      <Link href={`/workspaces/${workspace.id}/projects`}>
        <span>{workspace.name}</span>
      </Link>
      <div className="space-x-2">
        {canEdit && <EditWorkspaceDialog workspace={workspace} />}
        {canDelete && (
          <DeleteWorkspaceDialog
            workspaceId={workspace.id}
            workspaceName={workspace.name}
          />
        )}
      </div>
    </li>
  )
}

export default function WorkspaceList({
  workspaces,
  onRefetch,
}: WorkspaceListProps) {
  if (!workspaces.length)
    return <p className="text-gray-500 text-sm">No workspaces yet.</p>

  return (
    <ul className="divide-y border rounded-md">
      {workspaces.map(ws => (
        <WorkspaceItem key={ws.id} workspace={ws} />
      ))}
    </ul>
  )
}
