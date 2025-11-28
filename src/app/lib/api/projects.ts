import {
  CreateProjectInput,
  CreateProjectResponse,
  GetProjectResponse,
  GetProjectsResponse,
  UpdateProjectInput,
} from '../types/projects'
import { ApiSuccessResponse } from './response'

export async function getProjects(
  workspaceId: string
): Promise<ApiSuccessResponse<GetProjectsResponse>> {
  const res = await fetch(`/api/workspaces/${workspaceId}/projects`)
  if (!res.ok) throw new Error('Failed to fetch projects')
  const result = await res.json()
  return result
}

export async function createProject(
  input: CreateProjectInput
): Promise<ApiSuccessResponse<CreateProjectResponse>> {
  const res = await fetch(`/api/workspaces/${input.workspaceId}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: input.name,
      workspaceId: input.workspaceId,
      description: input.description,
      endpointSlug: input.endpointSlug,
    }),
  })
  if (!res.ok) throw new Error('Failed to create project')
  const result = await res.json()
  return result
}

export async function getProject(
  projectId: string
): Promise<ApiSuccessResponse<GetProjectResponse>> {
  const res = await fetch(`/api/projects/${projectId}`)
  if (!res.ok) throw new Error('Failed to fetch project')
  const result = await res.json()
  return result
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
): Promise<ApiSuccessResponse<GetProjectResponse>> {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update project')
  const result = await res.json()
  return result
}
