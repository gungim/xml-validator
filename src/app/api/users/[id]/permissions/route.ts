import { Role } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
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

    return NextResponse.json({ data: permissions })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role === Role.ADMIN) {
      return NextResponse.json(
        { error: 'Cannot assign permissions to admin users' },
        { status: 400 }
      )
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: validatedData.workspaceId },
    })

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
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

    return NextResponse.json({ data: permission }, { status: 201 })
  } catch (error) {
    console.error('Error assigning permission:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to assign permission' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const workspaceId = request.nextUrl.searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing workspaceId' },
        { status: 400 }
      )
    }

    await prisma.userPermission.delete({
      where: {
        userId_workspaceId: {
          userId: id,
          workspaceId,
        },
      },
    })

    return NextResponse.json({ data: null }, { status: 204 })
  } catch (error) {
    console.error('Error removing permission:', error)
    return NextResponse.json(
      { error: 'Failed to remove permission' },
      { status: 500 }
    )
  }
}
