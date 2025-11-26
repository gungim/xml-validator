import { GetProjectsResponse, CreateProjectInput, CreateProjectResponse, GetProjectResponse, UpdateProjectInput } from "../types/projects";

export async function getProjects(
  workspaceId: string,
): Promise<GetProjectsResponse> {
  const res = await fetch(`/api/workspaces/${workspaceId}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function createProject(
  input: CreateProjectInput
): Promise<CreateProjectResponse> {
  const res = await fetch(`/api/workspaces/${input.workspaceId}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function getProject(projectId: string): Promise<GetProjectResponse> {
  const res = await fetch(`/api/projects/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
): Promise<CreateProjectResponse> {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}
