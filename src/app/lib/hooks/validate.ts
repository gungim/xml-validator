import { useMutation, useQuery } from '@tanstack/react-query'
import { validate } from '../api/validate'
import { getValidationLogs } from '../api/validation-logs'

export function useValidate(endpointSlug: string, endpointSecret: string) {
  return useMutation({
    mutationFn: (xml: string) => validate(endpointSlug, xml, endpointSecret),
  })
}

export function useValidationLogs(projectId: string) {
  return useQuery({
    queryKey: ['validation-logs', projectId],
    queryFn: () => getValidationLogs(projectId),
    refetchInterval: 5000, // Refresh every 5 seconds
  })
}
