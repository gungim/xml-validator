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
  const { id: workspaceId } = await params

  if (!workspaceId) {
    return createErrorResponse('Missing workspaceId', 400)
  }

  try {
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        endpointSlug: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return createSuccessResponse(projects)
  } catch (err) {
    console.error('Failed to fetch projects:', err)
    return createErrorResponse('Failed to fetch projects', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params

  try {
    const body = await request.json()

    // Validate required fields
    if (
      !body.name ||
      typeof body.name !== 'string' ||
      body.name.trim().length === 0
    ) {
      return createErrorResponse('Project name is required', 400)
    }

    // Verify workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    if (!workspace) {
      return createErrorResponse('Workspace not found', 404)
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        endpointSlug: body.endpointSlug?.trim() || undefined,
        workspaceId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        endpointSlug: true,
        endpointSecret: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return createSuccessResponse(project)
  } catch (err) {
    console.error('Failed to create project:', err)
    return createErrorResponse('Failed to create project', 500)
  }
}
