import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import {
  createErrorResponse,
  createSuccessResponse,
} from '../../lib/api/response'
import { prisma } from '../../lib/db'
import { createUserSchema } from '../../lib/types/users'

export async function GET(request: NextRequest) {
  try {
    const roleFilter = request.nextUrl.searchParams.get('role')
    const limit = Number(request.nextUrl.searchParams.get('limit')) || 50
    const offset = Number(request.nextUrl.searchParams.get('offset')) || 0
    const total = await prisma.user.count({
      where: roleFilter ? { role: roleFilter as Role } : undefined,
    })

    const users = await prisma.user.findMany({
      where: roleFilter ? { role: roleFilter as Role } : undefined,
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    return createSuccessResponse(users, total)
  } catch (error) {
    console.error('Error fetching users:', error)
    return createErrorResponse('Failed to fetch users', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = createUserSchema.parse(body)
    validatedData.password = await bcrypt.hash(validatedData.password, 10)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return createErrorResponse('Email already exists', 400)
    }

    // Create user
    const user = await prisma.user.create({
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
    console.error('Error creating user:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400)
    }

    return createErrorResponse('Failed to create user', 500)
  }
}
