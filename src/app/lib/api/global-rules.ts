import type {
  CreateGlobalRuleInput,
  CreateGlobalRuleResponse,
  GetGlobalRulesResponse,
  UpdateGlobalRuleInput,
  UpdateGlobalRuleResponse,
} from '../types/global-rules'
import { ApiSuccessResponse } from './response'

export async function getGlobalRules(
  workspaceId: string
): Promise<ApiSuccessResponse<GetGlobalRulesResponse>> {
  const res = await fetch(`/api/workspaces/${workspaceId}/global-rules`)
  if (!res.ok) throw new Error('Failed to fetch global rules')
  const result = await res.json()
  return result
}

export async function createGlobalRule(
  input: CreateGlobalRuleInput
): Promise<ApiSuccessResponse<CreateGlobalRuleResponse>> {
  const res = await fetch(`/api/workspaces/${input.workspaceId}/global-rules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create global rule')
  const result = await res.json()
  return result
}

export async function updateGlobalRule(
  id: number,
  input: UpdateGlobalRuleInput
): Promise<ApiSuccessResponse<UpdateGlobalRuleResponse>> {
  const res = await fetch(`/api/global-rules/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update global rule')
  const result = await res.json()
  return result
}

export async function deleteGlobalRule(
  id: number
): Promise<ApiSuccessResponse<unknown>> {
  const res = await fetch(`/api/global-rules/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete global rule')
  const result = await res.json()
  return result
}
