import { createSuccessResponse } from '@/src/app/lib/api/response'

const DATA_TYPES = ['string', 'number', 'boolean', 'object', 'array']

export async function GET() {
  return createSuccessResponse(DATA_TYPES)
}
