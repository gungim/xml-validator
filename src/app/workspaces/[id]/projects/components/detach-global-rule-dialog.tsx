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

interface DetachGlobalRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: {
    id: number
    name: string
    globalRule?: {
      id: number
      name: string
    } | null
  } | null
  onConfirm: () => Promise<void>
}

export function DetachGlobalRuleDialog({
  open,
  onOpenChange,
  rule,
  onConfirm,
}: DetachGlobalRuleDialogProps) {
  if (!rule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detach Global Rule</DialogTitle>
          <DialogDescription>
            Are you sure you want to detach this global rule? This will convert
            it to a custom rule.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Rule:</strong> {rule.name}
          </p>
          <p className="text-sm">
            <strong>Global Rule:</strong> {rule.globalRule?.name}
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
            Detach
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
