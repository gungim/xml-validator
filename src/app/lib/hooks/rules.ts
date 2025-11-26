import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRules, createRule, deleteRule } from "../api/rules";
import { CreateRuleInput } from "../types/rules";

export function useRules(projectId: string) {
  return useQuery({
    queryKey: ["rules", projectId],
    queryFn: () => getRules(projectId),
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRuleInput) => createRule(input),
    onSuccess: (_, variables) => {
      // Invalidate and refetch rules for this project
      queryClient.invalidateQueries({
        queryKey: ["rules", variables.projectId],
      });
    },
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: number) => deleteRule(ruleId),
    onSuccess: () => {
      // Invalidate all rules queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["rules"],
      });
    },
  });
}
