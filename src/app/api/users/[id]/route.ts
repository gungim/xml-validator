import {
  createErrorResponse,
  createSuccessResponse,
} from '@/src/app/lib/api/response'
import { NextRequest } from 'next/server'
import { prisma } from '../../../lib/db'
import { updateUserSchema } from '../../../lib/types/users'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return createErrorResponse('User not found', 404)
    }

    return createSuccessResponse(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return createErrorResponse('Failed to fetch user', 500)
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validatedData = updateUserSchema.parse(body)

    // If email is being updated, check if it already exists
    if (validatedData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser && existingUser.id !== id) {
        return createErrorResponse('Email already exists', 400)
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      include: {
        permissions: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return createSuccessResponse(user)
  } catch (error) {
    console.error('Error updating user:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400)
    }

    return createErrorResponse('Failed to update user', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    await prisma.user.delete({
      where: { id },
    })

    return createSuccessResponse(null)
  } catch (error) {
    console.error('Error deleting user:', error)
    return createErrorResponse('Failed to delete user', 500)
  }
}
