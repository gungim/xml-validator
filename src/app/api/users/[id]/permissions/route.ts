import {
  createErrorResponse,
  createSuccessResponse,
} from '@/src/app/lib/api/response'
import { Role } from '@prisma/client'
import { NextRequest } from 'next/server'
import { prisma } from '../../../../lib/db'
import { assignPermissionSchema } from '../../../../lib/types/users'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const permissions = await prisma.userPermission.findMany({
      where: { userId: id },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return createSuccessResponse(permissions)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return createErrorResponse('Failed to fetch permissions', 500)
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validatedData = assignPermissionSchema.parse(body)

    // Check if user exists and is not an admin
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    if (user.role === Role.ADMIN) {
      return createErrorResponse(
        'Cannot assign permissions to admin users',
        400
      )
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: validatedData.workspaceId },
    })

    if (!workspace) {
      return createErrorResponse('Workspace not found', 404)
    }

    // Create or update permission
    const permission = await prisma.userPermission.upsert({
      where: {
        userId_workspaceId: {
          userId: id,
          workspaceId: validatedData.workspaceId,
        },
      },
      create: {
        userId: id,
        workspaceId: validatedData.workspaceId,
        permission: validatedData.permission,
      },
      update: {
        permission: validatedData.permission,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return createSuccessResponse(permission)
  } catch (error) {
    console.error('Error assigning permission:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400)
    }

    return createErrorResponse('Failed to assign permission', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const workspaceId = request.nextUrl.searchParams.get('workspaceId')

    if (!workspaceId) {
      return createErrorResponse('Missing workspaceId', 400)
    }

    await prisma.userPermission.delete({
      where: {
        userId_workspaceId: {
          userId: id,
          workspaceId,
        },
      },
    })

    return createSuccessResponse(null)
  } catch (error) {
    console.error('Error removing permission:', error)
    return createErrorResponse('Failed to remove permission', 500)
  }
}
