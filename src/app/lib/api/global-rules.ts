import type {
  GetGlobalRulesResponse,
  CreateGlobalRuleInput,
  CreateGlobalRuleResponse,
  UpdateGlobalRuleInput,
  UpdateGlobalRuleResponse,
} from "../types/global-rules";

export async function getGlobalRules(
  workspaceId: string
): Promise<GetGlobalRulesResponse> {
  const res = await fetch(`/api/workspaces/${workspaceId}/global-rules`);
  if (!res.ok) throw new Error("Failed to fetch global rules");
  return res.json();
}

export async function createGlobalRule(
  input: CreateGlobalRuleInput
): Promise<CreateGlobalRuleResponse> {
  const res = await fetch(`/api/workspaces/${input.workspaceId}/global-rules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create global rule");
  return res.json();
}

export async function updateGlobalRule(
  id: number,
  input: UpdateGlobalRuleInput
): Promise<UpdateGlobalRuleResponse> {
  const res = await fetch(`/api/global-rules/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update global rule");
  return res.json();
}

export async function deleteGlobalRule(id: number): Promise<void> {
  const res = await fetch(`/api/global-rules/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete global rule");
}
