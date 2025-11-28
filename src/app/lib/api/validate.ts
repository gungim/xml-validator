import { ValidationResult } from '../validation/xml-validator'

export const validate = async (
  endpointSlug: string,
  xml: string,
  endpointSecret: string
): Promise<ValidationResult> => {
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
