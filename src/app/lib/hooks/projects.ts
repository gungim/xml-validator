import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjects, createProject, getProject, updateProject } from "../api/projects";
import { CreateProjectInput, UpdateProjectInput } from "../types/projects";

export function useProjects(workspace_id: string) {
  return useQuery({
    queryKey: ["projects", workspace_id],
    queryFn: () => getProjects(workspace_id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: (_, variables) => {
      // Invalidate and refetch projects for this workspace
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.workspaceId],
      });
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: UpdateProjectInput }) =>
      updateProject(projectId, input),
    onSuccess: (data) => {
      // Invalidate the specific project and the projects list
      queryClient.invalidateQueries({
        queryKey: ["project", data?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });
}
