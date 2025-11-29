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

interface DeleteRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: {
    id: number
    name: string
    path: string
    children?: any[]
  } | null
  onConfirm: () => Promise<void>
}

export function DeleteRuleDialog({
  open,
  onOpenChange,
  rule,
  onConfirm,
}: DeleteRuleDialogProps) {
  if (!rule) return null

  const childCount = rule.children?.length || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Rule</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this rule?
            {childCount > 0 && (
              <span className="block mt-2 font-semibold text-orange-600">
                This rule has {childCount} child rule(s). Deleting it will also
                delete all children.
              </span>
            )}
            <span className="block mt-2">This action cannot be undone.</span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">
            <strong>Name:</strong> {rule.name}
          </p>
          <p className="text-sm">
            <strong>Path:</strong> {rule.path}
          </p>
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
            Delete Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
