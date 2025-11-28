import { ApiSuccessResponse } from './response'

export async function getDataTypes(): Promise<ApiSuccessResponse<string[]>> {
  const res = await fetch('/api/data-types')
  if (!res.ok) throw new Error('Failed to fetch data types')
  const result = await res.json()
  return result
}
