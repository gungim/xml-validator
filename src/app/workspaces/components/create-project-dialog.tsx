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
import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useCreateProject } from '../../lib/hooks/projects'
import { CreateProjectResponse } from '../../lib/types/projects'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').trim(),
  endpointSlug: z
    .string()
    .min(1, 'Endpoint slug is required')
    .max(64, 'Slug must be 64 characters or fewer')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and dashes only'),
  description: z.string().optional(),
})

interface CreateProjectDialogProps {
  workspaceId: string
}

export function CreateProjectDialog({ workspaceId }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [latestProject, setLatestProject] =
    useState<CreateProjectResponse | null>(null)
  const {
    mutateAsync: createProject,
    data,
    isPending,
    error,
  } = useCreateProject()
  const slugPlaceholder = useMemo(
    () => `workspace-${Math.floor(Math.random() * 1_000)}`,
    []
  )

  const normalizeSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      endpointSlug: '',
    },
    onSubmit: async ({ value }) => {
      try {
        createProject({
          name: value.name,
          workspaceId,
          description: value.description || undefined,
          endpointSlug: value.endpointSlug,
        }).then(result => {
          if (result.data) {
            setLatestProject(result.data)
          }
          setOpen(false)
          form.reset()
        })
      } catch (error) {
        console.error('Failed to create project:', error)
      }
    },
  })

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create Project</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to your workspace.
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
                    placeholder="Enter project name"
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
                  const result =
                    projectSchema.shape.endpointSlug.safeParse(value)
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
                    placeholder={slugPlaceholder}
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Final URL:{' '}
                    <code>
                      /api/validate/{field.state.value || slugPlaceholder}
                    </code>
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
                Failed to create project. Please try again.
              </p>
            )}

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
                {isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {latestProject && (
        <div className="mt-4 rounded border bg-muted/40 p-4 basis-full">
          <p className="text-sm font-medium mb-2">
            Endpoint created. Keep this API key safe!
          </p>
          <div className="space-y-1 text-sm">
            <div>
              URL: <code>/api/validate/{latestProject.endpointSlug}</code>
            </div>
            <div>
              Header <code>X-API-Key</code>:{' '}
              <code className="break-all">{latestProject.endpointSecret}</code>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
