import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BulkCreateRequest } from '../../api/rules/bulk-create/route'
import {
  createBulkRules,
  createRule,
  deleteRule,
  getRule,
  getRules,
  updateRule,
} from '../api/rules'
import { CreateRuleInput, UpdateRuleInput } from '../types/rules'

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
    mutationFn: ({ id, data }: { id: number; data: UpdateRuleInput }) =>
      updateRule(id, data),
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
    mutationFn: async (data: BulkCreateRequest) => {
      return createBulkRules(data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['rules', variables.projectId],
      })
    },
  })
}
