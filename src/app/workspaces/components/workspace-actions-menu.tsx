'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MenuIcon } from 'lucide-react'
import { usePermissions } from '../../lib/hooks/users'
import { DeleteWorkspaceDialog } from './delete-workspace-dialog'
import { EditWorkspaceDialog } from './edit-workspace-dialog'

interface WorkspaceActionsMenuProps {
  workspace: {
    id: string
    name: string
  }
}

export function WorkspaceActionsMenu({ workspace }: WorkspaceActionsMenuProps) {
  const { canEdit, canDelete } = usePermissions(workspace.id)

  // If user has no edit or delete permissions, don't render the menu
  if (!canEdit && !canDelete) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {canEdit && (
          <EditWorkspaceDialog
            workspace={workspace}
            trigger={
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                Edit
              </DropdownMenuItem>
            }
          />
        )}
        {canDelete && (
          <DeleteWorkspaceDialog
            workspaceId={workspace.id}
            workspaceName={workspace.name}
            trigger={
              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                Delete
              </DropdownMenuItem>
            }
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
