'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MenuIcon } from 'lucide-react'
import { DeleteWorkspaceDialog } from './delete-workspace-dialog'
import { EditWorkspaceDialog } from './edit-workspace-dialog'

interface WorkspaceActionsMenuProps {
  workspace: {
    id: string
    name: string
  }
}

export function WorkspaceActionsMenu({ workspace }: WorkspaceActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <EditWorkspaceDialog
          workspace={workspace}
          trigger={
            <DropdownMenuItem onSelect={e => e.preventDefault()}>
              Edit
            </DropdownMenuItem>
          }
        />
        <DeleteWorkspaceDialog
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          trigger={
            <DropdownMenuItem onSelect={e => e.preventDefault()}>
              Delete
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
