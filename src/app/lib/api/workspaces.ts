// src/lib/api/workspaces.ts

import { Workspace } from '@prisma/client'
import { ApiSuccessResponse } from './response'

export type WorkspacePayload = {
  id?: string
  name: string
}

export type WorkspaceWithProjects = Workspace & {
  projects: Array<{
    id: string
    name: string
    description: string | null
    endpointSlug: string
    createdAt: Date
    updatedAt: Date
  }>
}

export async function getWorkspaces(): Promise<
  ApiSuccessResponse<Workspace[]>
> {
  const res = await fetch('/api/workspaces', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch workspaces')
  const result = await res.json()
  return result
}

export async function createWorkspace(
  data: WorkspacePayload
): Promise<ApiSuccessResponse<Workspace>> {
  const res = await fetch('/api/workspaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create workspace')
  const result = await res.json()
  return result
}

export async function updateWorkspace(
  data: WorkspacePayload
): Promise<ApiSuccessResponse<Workspace>> {
  const res = await fetch('/api/workspaces', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update workspace')
  const result = await res.json()
  return result
}

export async function deleteWorkspace(
  id: string
): Promise<ApiSuccessResponse<Workspace>> {
  const res = await fetch('/api/workspaces', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error('Failed to delete workspace')
  const result = await res.json()
  return result
}

export async function getWorkspace(
  id: string
): Promise<ApiSuccessResponse<WorkspaceWithProjects>> {
  const res = await fetch(`/api/workspaces/${id}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error('Failed to fetch workspace')
  const result = await res.json()
  return result
}
