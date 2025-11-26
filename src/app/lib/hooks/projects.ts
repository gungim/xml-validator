import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjects, createProject } from "../api/projects";
import { CreateProjectInput } from "../types/projects";

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
