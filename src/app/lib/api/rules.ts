import {
  CreateRuleInput,
  CreateRuleResponse,
  GetRulesResponse,
  RuleWithChildren,
} from '../types/rules'
import { ApiSuccessResponse } from './response'

export async function getRules(
  projectId: string
): Promise<ApiSuccessResponse<GetRulesResponse>> {
  const res = await fetch(`/api/projects/${projectId}/rules`)
  if (!res.ok) throw new Error('Failed to fetch rules')
  const result = await res.json()
  return result
}

export async function getRule(
  ruleId: number
): Promise<ApiSuccessResponse<RuleWithChildren>> {
  const res = await fetch(`/api/rules/${ruleId}`)
  if (!res.ok) throw new Error('Failed to fetch rule')
  const result = await res.json()
  return result
}

export async function createRule(
  input: CreateRuleInput
): Promise<ApiSuccessResponse<CreateRuleResponse>> {
  const res = await fetch(`/api/projects/${input.projectId}/rules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create rule')
  const result = await res.json()
  return result
}

export async function deleteRule(
  ruleId: number
): Promise<ApiSuccessResponse<unknown>> {
  const res = await fetch(`/api/rules/${ruleId}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete rule')
  const result = await res.json()
  return result
}

export async function updateRule(
  ruleId: number,
  data: {
    name?: string
    path?: string
    dataType?: string
    required?: boolean
    description?: string | null
    condition?: any
    globalRuleId?: number | null
  }
): Promise<ApiSuccessResponse<any>> {
  const res = await fetch(`/api/rules/${ruleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update rule')
  const result = await res.json()
  return result
}
