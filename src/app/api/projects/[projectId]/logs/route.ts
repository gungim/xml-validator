import { NextRequest } from 'next/server'
import {
  createErrorResponse,
  createSuccessResponse,
} from '../../../../lib/api/response'
import { prisma } from '../../../../lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const searchParams = request.nextUrl.searchParams
    const limit = Number(searchParams.get('limit')) || 50
    const offset = Number(searchParams.get('offset')) || 0

    const [logs, total] = await Promise.all([
      prisma.validationLog.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.validationLog.count({
        where: { projectId },
      }),
    ])

    return createSuccessResponse(logs, total)
  } catch (error) {
    console.error('Error fetching validation logs:', error)
    return createErrorResponse('Failed to fetch validation logs', 500)
  }
}
