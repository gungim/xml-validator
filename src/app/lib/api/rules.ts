import { 
  GetRulesResponse, 
  CreateRuleInput, 
  CreateRuleResponse 
} from "../types/rules";

export async function getRules(projectId: string): Promise<GetRulesResponse> {
  const res = await fetch(`/api/projects/${projectId}/rules`);
  if (!res.ok) throw new Error("Failed to fetch rules");
  return res.json();
}

export async function createRule(
  input: CreateRuleInput
): Promise<CreateRuleResponse> {
  const res = await fetch(`/api/projects/${input.projectId}/rules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create rule");
  return res.json();
}

export async function deleteRule(ruleId: number): Promise<{ success: boolean }> {
  const res = await fetch(`/api/rules/${ruleId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete rule");
  return res.json();
}

export async function updateRule(
  ruleId: number,
  data: { globalRuleId?: number | null }
): Promise<any> {
  const res = await fetch(`/api/rules/${ruleId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update rule");
  return res.json();
}
