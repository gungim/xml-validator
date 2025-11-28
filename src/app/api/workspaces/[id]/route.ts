import {
  createErrorResponse,
  createSuccessResponse,
} from '@/src/app/lib/api/response'
import { prisma } from '@/src/app/lib/db'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: { projects: true },
    })

    if (!workspace) {
      return createErrorResponse('Workspace not found', 404)
    }

    return createSuccessResponse(workspace)
  } catch (err) {
    console.error('Failed to fetch workspace:', err)
    return createErrorResponse('Internal server error', 500)
  }
}
