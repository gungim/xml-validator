import {
  createErrorResponse,
  createSuccessResponse,
} from '@/src/app/lib/api/response'
import { prisma } from '@/src/app/lib/db'
import { UpdateProjectInput } from '@/src/app/lib/types/projects'
import {
  generateProjectSecret,
  normalizeEndpointSlug,
} from '@/src/app/lib/utils/projects'
import { Prisma } from '@prisma/client'
import { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { rules: true },
    })

    if (!project) {
      return createErrorResponse('Project not found', 404)
    }

    return createSuccessResponse(project)
  } catch (err) {
    console.error('Failed to fetch project:', err)
    return createErrorResponse('Failed to fetch project', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const body: UpdateProjectInput = await request.json()
    const updateData: Prisma.ProjectUpdateInput = {}

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return createErrorResponse('Name must be a non-empty string', 400)
      }
      updateData.name = body.name.trim()
    }

    if (body.description !== undefined) {
      updateData.description =
        typeof body.description === 'string' && body.description.length > 0
          ? body.description
          : null
    }

    if (body.endpointSlug !== undefined) {
      if (typeof body.endpointSlug !== 'string') {
        return createErrorResponse('Endpoint slug must be a string', 400)
      }
      try {
        updateData.endpointSlug = normalizeEndpointSlug(body.endpointSlug)
      } catch {
        return createErrorResponse('Endpoint slug is invalid', 400)
      }
    }

    if (body.regenerateSecret) {
      updateData.endpointSecret = generateProjectSecret()
    }

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse('No valid fields provided', 400)
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    })

    return createSuccessResponse(project)
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return createErrorResponse('Endpoint slug already exists', 409)
    }
    console.error('Failed to update project:', err)
    return createErrorResponse('Failed to update project', 500)
  }
}
