'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDeleteWorkspace } from '../../lib/hooks/workspaces'

interface DeleteWorkspaceDialogProps {
  workspaceId: string
  workspaceName: string
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function DeleteWorkspaceDialog({
  workspaceId,
  workspaceName,
  trigger,
  onSuccess,
}: DeleteWorkspaceDialogProps) {
  const [open, setOpen] = useState(false)
  const { mutateAsync: deleteWorkspace, isPending } = useDeleteWorkspace()
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await deleteWorkspace(workspaceId)
      setOpen(false)
      if (onSuccess) {
        onSuccess()
      } else {
        // Default behavior: redirect to workspaces list
        router.push('/workspaces')
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            workspace <strong>{workspaceName}</strong> and remove all associated
            projects and data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isPending ? 'Deleting...' : 'Delete Workspace'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
