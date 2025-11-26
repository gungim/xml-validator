import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/projects";

export function useProjects(workspace_id: string) {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(workspace_id),
  });
}
