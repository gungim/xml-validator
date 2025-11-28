'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { z } from 'zod'
import { useUpdateWorkspace } from '../../lib/hooks/workspaces'

const workspaceSchema = z.object({
  name: z.string().min(1, 'Name must be at least 1 character'),
})

interface EditWorkspaceDialogProps {
  workspace: {
    id: string
    name: string
  }
  trigger?: React.ReactNode
}

export function EditWorkspaceDialog({
  workspace,
  trigger,
}: EditWorkspaceDialogProps) {
  const [open, setOpen] = useState(false)
  const { mutateAsync: updateWorkspace, isPending } = useUpdateWorkspace()

  const form = useForm({
    defaultValues: {
      name: workspace.name,
    },
    validators: {
      onChange: workspaceSchema,
    },
    onSubmit: async ({ value }) => {
      await updateWorkspace({
        id: workspace.id,
        name: value.name,
      })
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
          <DialogDescription>
            Make changes to your workspace here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <form.Field name="name">
              {field => {
                const isInvalid =
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                return (
                  <Field data-invalid={isInvalid}>
                    <Label htmlFor={field.name}>Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={e => field.handleChange(e.target.value)}
                      placeholder="Workspace name"
                      disabled={isPending}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
