import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGlobalRules,
  createGlobalRule,
  updateGlobalRule,
  deleteGlobalRule,
} from "../api/global-rules";
import type { CreateGlobalRuleInput, UpdateGlobalRuleInput } from "../types/global-rules";

export function useGlobalRules(workspaceId: string) {
  return useQuery({
    queryKey: ["globalRules", workspaceId],
    queryFn: () => getGlobalRules(workspaceId),
  });
}

export function useCreateGlobalRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGlobalRuleInput) => createGlobalRule(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["globalRules", variables.workspaceId],
      });
    },
  });
}

export function useUpdateGlobalRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateGlobalRuleInput }) =>
      updateGlobalRule(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["globalRules"],
      });
    },
  });
}

export function useDeleteGlobalRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteGlobalRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["globalRules"],
      });
    },
  });
}
