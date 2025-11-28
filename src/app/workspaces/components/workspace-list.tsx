'use client'

import { Workspace } from '@prisma/client'
import Link from 'next/link'
import { DeleteWorkspaceDialog } from './delete-workspace-dialog'
import { EditWorkspaceDialog } from './edit-workspace-dialog'

interface WorkspaceListProps {
  workspaces: Workspace[]
  onRefetch: () => void
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
        <li key={ws.id} className="flex justify-between items-center px-4 py-2">
          <Link href={`/workspaces/${ws.id}/projects`}>
            <span>{ws.name}</span>
          </Link>
          <div className="space-x-2">
            <EditWorkspaceDialog workspace={ws} />
            <DeleteWorkspaceDialog
              workspaceId={ws.id}
              workspaceName={ws.name}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
