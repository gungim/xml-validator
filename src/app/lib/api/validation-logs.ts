import { ValidationLog } from '@prisma/client'
import { ApiSuccessResponse } from './response'

export const getValidationLogs = async (
  projectId: string
): Promise<ApiSuccessResponse<ValidationLog[]>> => {
  const res = await fetch(`/api/projects/${projectId}/logs`)
  if (!res.ok) throw new Error('Failed to fetch logs')
  return await res.json()
}
