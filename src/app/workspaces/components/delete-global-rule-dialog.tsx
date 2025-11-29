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

interface DeleteGlobalRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  globalRule: {
    id: number
    name: string
    description: string | null
    children?: any[]
  } | null
  onConfirm: () => Promise<void>
}

export function DeleteGlobalRuleDialog({
  open,
  onOpenChange,
  globalRule,
  onConfirm,
}: DeleteGlobalRuleDialogProps) {
  if (!globalRule) return null

  const childCount = globalRule.children?.length || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Global Rule</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this global rule?
            {childCount > 0 && (
              <span className="block mt-2 font-semibold text-orange-600">
                This global rule has {childCount} child rule(s). Deleting it
                will also delete all children.
              </span>
            )}
            <span className="block mt-2 font-semibold text-orange-600">
              Project rules using this global rule will lose this reference.
            </span>
            <span className="block mt-2">This action cannot be undone.</span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <p className="text-sm">
            <strong>Name:</strong> {globalRule.name}
          </p>
          {globalRule.description && (
            <p className="text-sm">
              <strong>Description:</strong> {globalRule.description}
            </p>
          )}
        </div>
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
            onClick={async () => {
              await onConfirm()
            }}
          >
            Delete Global Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
