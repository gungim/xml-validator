import {
  createErrorResponse,
  createSuccessResponse,
} from '@/src/app/lib/api/response'
import { prisma } from '@/src/app/lib/db'
import { CreateGlobalRuleInput } from '@/src/app/lib/types/global-rules'
import { NextRequest } from 'next/server'

const VALID_DATA_TYPES = [
  'string',
  'number',
  'boolean',
  'object',
  'array',
] as const

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params

  try {
    const globalRules = await prisma.globalRule.findMany({
      where: { workspaceId },
      include: {
        children: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return createSuccessResponse(globalRules)
  } catch (err) {
    console.error('Failed to fetch global rules:', err)
    return createErrorResponse('Failed to fetch global rules', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params

  try {
    const body: CreateGlobalRuleInput = await request.json()

    // Basic validation
    if (
      !body.name ||
      typeof body.name !== 'string' ||
      body.name.trim().length === 0
    ) {
      return createErrorResponse('Global rule name is required', 400)
    }

    if (!body.dataType || typeof body.dataType !== 'string') {
      return createErrorResponse('Data type is required', 400)
    }

    // Validate dataType
    if (!VALID_DATA_TYPES.includes(body.dataType as any)) {
      return createErrorResponse(
        `Invalid data type. Must be one of: ${VALID_DATA_TYPES.join(', ')}`,
        400
      )
    }

    // Validate parent if parentId is provided
    if (body.parentId) {
      const parent = await prisma.globalRule.findUnique({
        where: { id: body.parentId },
        include: { children: true },
      })

      if (!parent) {
        return createErrorResponse('Parent global rule not found', 404)
      }

      if (parent.workspaceId !== workspaceId) {
        return createErrorResponse(
          'Parent global rule belongs to a different workspace',
          400
        )
      }

      // Only object and array types can have children
      if (parent.dataType !== 'object' && parent.dataType !== 'array') {
        return createErrorResponse(
          'Only object and array global rules can have children',
          400
        )
      }

      // Array rules can only have 1 child
      if (parent.dataType === 'array' && parent.children.length >= 1) {
        return createErrorResponse(
          'Array global rules can only have 1 child',
          400
        )
      }
    }

    // Check for duplicate name within workspace
    const existing = await prisma.globalRule.findFirst({
      where: {
        workspaceId,
        name: body.name.trim(),
      },
    })

    if (existing) {
      return createErrorResponse(
        'A global rule with this name already exists in this workspace',
        400
      )
    }

    const globalRule = await prisma.globalRule.create({
      data: {
        name: body.name.trim(),
        description: body.description || null,
        dataType: body.dataType as any,
        condition: body.condition || {},
        workspaceId,
        parentId: body.parentId || null,
      },
    })

    return createSuccessResponse(globalRule)
  } catch (err) {
    console.error('Failed to create global rule:', err)
    return createErrorResponse('Failed to create global rule', 500)
  }
}
