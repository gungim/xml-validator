import { ValidationResult } from '../validation/xml-validator'
import { ApiSuccessResponse } from './response'

export const validate = async (
  endpointSlug: string,
  xml: string,
  endpointSecret: string
): Promise<ApiSuccessResponse<ValidationResult>> => {
  const response = await fetch(`/api/validate/${endpointSlug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      'X-API-Key': endpointSecret,
    },
    body: xml,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Validation failed')
  }

  const result = await response.json()
  return result
}
