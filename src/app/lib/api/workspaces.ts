// src/lib/api/workspaces.ts

import { GetWorkspaceDetailResponse } from "../../api/workspaces/[id]/route";
import { GetWorkspacesResponse } from "../../api/workspaces/route";

export type WorkspacePayload = {
  id?: string;
  name: string;
};

export async function getWorkspaces(): Promise<GetWorkspacesResponse> {
  const res = await fetch("/api/workspaces", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch workspaces");
  return res.json();
}

export async function createWorkspace(data: WorkspacePayload) {
  const res = await fetch("/api/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create workspace");
  return res.json();
}

export async function updateWorkspace(data: WorkspacePayload) {
  const res = await fetch("/api/workspaces", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update workspace");
  return res.json();
}

export async function deleteWorkspace(id: string) {
  const res = await fetch("/api/workspaces", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to delete workspace");
  return res.json();
}

export async function getWorkspace(
  id: string,
): Promise<GetWorkspaceDetailResponse> {
  const res = await fetch(`/api/workspaces/${id}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch workspaces");
  return res.json();
}
