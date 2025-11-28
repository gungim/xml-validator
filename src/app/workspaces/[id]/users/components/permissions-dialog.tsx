'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useAssignPermission,
  useRemovePermission,
} from '@/src/app/lib/hooks/users'
import { useWorkspaces } from '@/src/app/lib/hooks/workspaces'
import { UserWithPermissions } from '@/src/app/lib/types/users'
import { Permission } from '@prisma/client'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface PermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithPermissions | null
}

export function PermissionsDialog({
  open,
  onOpenChange,
  user,
}: PermissionsDialogProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('')
  const [selectedPermission, setSelectedPermission] = useState<Permission>(
    Permission.READ
  )
  const {
    mutateAsync: assignPermission,
    isPending: isAssigningPermission,
    error: assignPermissionError,
  } = useAssignPermission(user?.id || '')
  const {
    mutateAsync: removePermission,
    isPending: isRemovingPermission,
    error: removePermissionError,
  } = useRemovePermission(user?.id || '')

  // Fetch workspaces
  const { data: workspacesData } = useWorkspaces()

  const handleAssignPermission = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedWorkspaceId) {
      assignPermission({
        workspaceId: selectedWorkspaceId,
        permission: selectedPermission,
      })
    }
  }

  if (!user) return null

  const workspaces = workspacesData?.data || []
  const availableWorkspaces = workspaces.filter(
    (ws: any) => !user.permissions.some(p => p.workspaceId === ws.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Permissions - {user.name}</DialogTitle>
          <DialogDescription>
            Assign workspace permissions to this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Permissions */}
          <div>
            <h3 className="text-sm font-medium mb-3">Current Permissions</h3>
            {user.permissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No permissions assigned yet.
              </p>
            ) : (
              <div className="space-y-2">
                {user.permissions.map(permission => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {permission.workspace?.name || 'Unknown Workspace'}
                      </span>
                      <Badge
                        variant={
                          permission.permission === Permission.EDIT
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {permission.permission}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePermission(permission.workspaceId)}
                      disabled={isRemovingPermission}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Permission */}
          <div>
            <h3 className="text-sm font-medium mb-3">Add New Permission</h3>
            <form onSubmit={handleAssignPermission} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="workspace">Workspace</Label>
                <Select
                  value={selectedWorkspaceId}
                  onValueChange={setSelectedWorkspaceId}
                >
                  <SelectTrigger id="workspace" className="w-full">
                    <SelectValue placeholder="Select workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWorkspaces.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No available workspaces
                      </div>
                    ) : (
                      availableWorkspaces.map((workspace: any) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="permission">Permission Level</Label>
                <Select
                  value={selectedPermission}
                  onValueChange={value =>
                    setSelectedPermission(value as Permission)
                  }
                >
                  <SelectTrigger id="permission" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Permission.READ}>Read</SelectItem>
                    <SelectItem value={Permission.EDIT}>Edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {assignPermissionError && (
                <p className="text-sm text-red-500">
                  {assignPermissionError.message}
                </p>
              )}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    !selectedWorkspaceId ||
                    isAssigningPermission ||
                    availableWorkspaces.length === 0
                  }
                >
                  {isAssigningPermission ? 'Assigning...' : 'Assign Permission'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
