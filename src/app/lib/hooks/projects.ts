import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createProject,
  getProject,
  getProjects,
  updateProject,
} from '../api/projects'
import { CreateProjectInput, UpdateProjectInput } from '../types/projects'

export function useProjects(workspace_id: string) {
  return useQuery({
    queryKey: ['projects', workspace_id],
    queryFn: () => getProjects(workspace_id),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.workspaceId],
      })
    },
  })
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
  })
}

export function useUpdateProject(workspaceId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string
      input: UpdateProjectInput
    }) => updateProject(projectId, input),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ['project', data.data.id],
      })
      if (workspaceId) {
        queryClient.invalidateQueries({
          queryKey: ['projects', workspaceId],
        })
      }
    },
  })
}
