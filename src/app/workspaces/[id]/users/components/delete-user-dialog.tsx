'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteUser } from '@/src/app/lib/hooks/users'
import { UserWithPermissions } from '@/src/app/lib/types/users'

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithPermissions | null
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
}: DeleteUserDialogProps) {
  const {
    mutateAsync: deleteUser,
    isPending: isDeletingUser,
    error,
  } = useDeleteUser()

  const handleDelete = () => {
    if (user) {
      deleteUser(user.id)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">
            <strong>Name:</strong> {user.name}
          </p>
          <p className="text-sm">
            <strong>Email:</strong> {user.email}
          </p>
        </div>
        {error && <p className="text-sm text-red-500 mb-4">{error.message}</p>}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeletingUser}
          >
            {isDeletingUser ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
