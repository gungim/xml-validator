import { GetProjectsResponse } from "../../api/projects/route";

export async function getProjects(
  workspace_id: string,
): Promise<GetProjectsResponse> {
  const res = await fetch(`/api/workspaces/${workspace_id}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}
