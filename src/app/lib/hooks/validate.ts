import { useMutation } from '@tanstack/react-query'
import { validate } from '../api/validate'

export function useValidate(endpointSlug: string, endpointSecret: string) {
  return useMutation({
    mutationFn: (xml: string) => validate(endpointSlug, xml, endpointSecret),
  })
}
