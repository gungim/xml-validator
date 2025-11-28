import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRule,
  deleteRule,
  getRule,
  getRules,
  updateRule,
} from '../api/rules'
import { CreateRuleInput } from '../types/rules'

export function useRules(projectId: string) {
  return useQuery({
    queryKey: ['rules', projectId],
    queryFn: () => getRules(projectId),
  })
}

export function useRule(ruleId: number) {
  return useQuery({
    queryKey: ['rule', ruleId],
    queryFn: () => getRule(ruleId),
    enabled: !!ruleId,
  })
}

export function useCreateRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRuleInput) => createRule(input),
    onSuccess: (_, variables) => {
      // Invalidate and refetch rules for this project
      queryClient.invalidateQueries({
        queryKey: ['rules', variables.projectId],
      })
    },
  })
}

export function useDeleteRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleId: number) => deleteRule(ruleId),
    onSuccess: () => {
      // Invalidate all rules queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['rules'],
      })
    },
  })
}

export function useUpdateRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: {
        name?: string
        path?: string
        dataType?: string
        required?: boolean
        description?: string | null
        condition?: any
        globalRuleId?: number | null
      }
    }) => updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['rules'],
      })
      queryClient.invalidateQueries({
        queryKey: ['rule'],
      })
    },
  })
}

export function useBulkCreateRules() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      projectId,
      rules,
      parentId,
    }: {
      projectId: string
      rules: Array<{
        name: string
        path: string
        dataType: string
        required: boolean
        description?: string
        condition: any
        parentPath?: string
      }>
      parentId?: number
    }) => {
      const res = await fetch('/api/rules/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, rules, parentId }),
      })
      if (!res.ok) throw new Error('Failed to bulk create rules')
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['rules', variables.projectId],
      })
    },
  })
}
