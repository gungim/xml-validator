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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { z } from 'zod'
import { useUpdateProject } from '../../../../lib/hooks/projects'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').trim(),
  endpointSlug: z
    .string()
    .min(1, 'Endpoint slug is required')
    .max(64, 'Slug must be 64 characters or fewer')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and dashes only'),
  description: z.string().optional(),
})

interface EditProjectDialogProps {
  projectId: string
  currentName: string
  currentDescription?: string | null
  currentSlug: string
  workspaceId: string
  endpointSecret: string
}

export function EditProjectDialog({
  projectId,
  currentName,
  currentDescription,
  currentSlug,
  workspaceId,
  endpointSecret,
}: EditProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [secret, setSecret] = useState(endpointSecret)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const {
    mutateAsync: updateProject,
    isPending,
    error,
  } = useUpdateProject(workspaceId)

  const normalizeSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')

  const form = useForm({
    defaultValues: {
      name: currentName,
      description: currentDescription || '',
      endpointSlug: currentSlug,
    },
    onSubmit: async ({ value }) => {
      updateProject({
        projectId,
        input: {
          name: value.name,
          description: value.description || undefined,
          endpointSlug: value.endpointSlug,
        },
      }).then(() => {
        setOpen(false)
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update your project information.
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
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = projectSchema.shape.name.safeParse(value)
                if (!result.success) {
                  return result.error.issues[0].message
                }
                return undefined
              },
            }}
          >
            {field => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Project Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  disabled={isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="endpointSlug"
            validators={{
              onChange: ({ value }) => {
                const result = projectSchema.shape.endpointSlug.safeParse(value)
                if (!result.success) {
                  return result.error.issues[0].message
                }
                return undefined
              },
            }}
          >
            {field => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Endpoint Slug</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e =>
                    field.handleChange(normalizeSlug(e.target.value))
                  }
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Endpoint: <code>/api/validate/{field.state.value}</code>
                </p>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {field => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description (Optional)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="Enter project description"
                  disabled={isPending}
                />
              </div>
            )}
          </form.Field>

          {error && (
            <p className="text-sm text-red-500">
              Failed to update project. Please try again.
            </p>
          )}

          <div className="rounded border p-3 space-y-2">
            <div className="text-sm font-medium">API Access</div>
            <p className="text-xs text-muted-foreground">
              Provide this header when calling{' '}
              <code>/api/validate/{form.state.values.endpointSlug}</code>
            </p>
            <div className="flex gap-2">
              <Input readOnly value={secret} className="font-mono text-sm" />
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  if (
                    typeof navigator === 'undefined' ||
                    !navigator.clipboard
                  ) {
                    return
                  }
                  await navigator.clipboard.writeText(secret)
                  setCopyState('copied')
                  setTimeout(() => setCopyState('idle'), 2000)
                }}
              >
                {copyState === 'copied' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                if (
                  typeof window !== 'undefined' &&
                  !window.confirm(
                    'Regenerate secret? Existing clients will lose access.'
                  )
                ) {
                  return
                }
                updateProject({
                  projectId,
                  input: { regenerateSecret: true },
                }).then(result => {
                  if (result?.data?.endpointSecret) {
                    setSecret(result.data.endpointSecret)
                  }
                })
              }}
              disabled={isPending}
            >
              Regenerate secret
            </Button>
          </div>

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
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
