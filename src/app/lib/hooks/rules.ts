import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRules, getRule, createRule, deleteRule, updateRule } from "../api/rules";
import { CreateRuleInput } from "../types/rules";

export function useRules(projectId: string) {
  return useQuery({
    queryKey: ["rules", projectId],
    queryFn: () => getRules(projectId),
  });
}

export function useRule(ruleId: number) {
  return useQuery({
    queryKey: ["rule", ruleId],
    queryFn: () => getRule(ruleId),
    enabled: !!ruleId,
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

export function useUpdateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { 
      id: number; 
      data: {
        name?: string;
        path?: string;
        dataType?: string;
        required?: boolean;
        description?: string | null;
        condition?: any;
        globalRuleId?: number | null;
      }
    }) => updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rules"],
      });
      queryClient.invalidateQueries({
        queryKey: ["rule"],
      });
    },
  });
}
