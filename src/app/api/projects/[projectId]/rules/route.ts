import {
  createErrorResponse,
  createSuccessResponse,
} from '@/src/app/lib/api/response'
import { prisma } from '@/src/app/lib/db'
import { CreateRuleInput } from '@/src/app/lib/types/rules'
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
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params

  try {
    const rules = await prisma.rule.findMany({
      where: { projectId },
      include: {
        children: true,
        globalRule: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return createSuccessResponse(rules)
  } catch (err) {
    console.error('Failed to fetch rules:', err)
    return createErrorResponse('Failed to fetch rules', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params

  try {
    const body: CreateRuleInput = await request.json()

    // Basic validation
    if (
      !body.name ||
      typeof body.name !== 'string' ||
      body.name.trim().length === 0
    ) {
      return createErrorResponse('Rule name is required', 400)
    }

    if (
      !body.path ||
      typeof body.path !== 'string' ||
      body.path.trim().length === 0
    ) {
      return createErrorResponse('Rule path is required', 400)
    }

    if (!body.dataType || typeof body.dataType !== 'string') {
      return createErrorResponse('Data type is required', 400)
    }

    // Validate dataType is a valid enum value
    if (!VALID_DATA_TYPES.includes(body.dataType as any)) {
      return createErrorResponse(
        `Invalid data type. Must be one of: ${VALID_DATA_TYPES.join(', ')}`,
        400
      )
    }

    // Validate parent rule if parentId is provided
    if (body.parentId) {
      const parent = await prisma.rule.findUnique({
        where: { id: body.parentId },
        include: { children: true },
      })

      if (!parent) {
        return createErrorResponse('Parent rule not found', 404)
      }

      if (parent.projectId !== projectId) {
        return createErrorResponse(
          'Parent rule belongs to a different project',
          400
        )
      }

      // Only object and array types can have children
      if (parent.dataType !== 'object' && parent.dataType !== 'array') {
        return createErrorResponse(
          'Only object and array rules can have child rules',
          400
        )
      }

      // Array rules can only have 1 child
      if (parent.dataType === 'array' && parent.children.length >= 1) {
        return createErrorResponse(
          'Array rules can only have 1 child rule',
          400
        )
      }
    }

    // Validate global rule if globalRuleId is provided
    if (body.globalRuleId) {
      const globalRule = await prisma.globalRule.findUnique({
        where: { id: body.globalRuleId },
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: true, // Support up to 3 levels deep
                },
              },
            },
          },
        },
      })

      if (!globalRule) {
        return createErrorResponse('Global rule not found', 404)
      }

      // Verify data type matches
      if (globalRule.dataType !== body.dataType) {
        return createErrorResponse(
          `Data type mismatch. Global rule is ${globalRule.dataType}, but rule is ${body.dataType}`,
          400
        )
      }

      // Recursive function to create rule with children
      async function createRuleWithChildren(
        globalRuleData: any,
        parentRuleId: number | null,
        parentPath: string
      ): Promise<any> {
        // Create the rule
        const createdRule = await prisma.rule.create({
          data: {
            name: globalRuleData.name,
            path: parentRuleId
              ? `${parentPath}.${globalRuleData.name}`
              : body.path.trim(),
            required: body.required ?? false,
            dataType: globalRuleData.dataType,
            description: globalRuleData.description,
            condition: globalRuleData.condition,
            projectId,
            parentId: parentRuleId,
            globalRuleId: globalRuleData.id,
          },
        })

        // Recursively create children if any
        if (globalRuleData.children && globalRuleData.children.length > 0) {
          for (const childGlobalRule of globalRuleData.children) {
            await createRuleWithChildren(
              childGlobalRule,
              createdRule.id,
              createdRule.path
            )
          }
        }

        return createdRule
      }

      // Create rule and all children recursively
      const rule = await createRuleWithChildren(
        globalRule,
        body.parentId || null,
        body.path
      )
      return createSuccessResponse(rule)
    }

    // Normal rule creation without global rule
    const rule = await prisma.rule.create({
      data: {
        name: body.name.trim(),
        path: body.path.trim(),
        required: body.required ?? false,
        dataType: body.dataType as any,
        description: body.description || null,
        condition: body.condition || {},
        projectId,
        parentId: body.parentId || null,
        globalRuleId: null,
      },
    })

    return createSuccessResponse(rule)
  } catch (err) {
    console.error('Failed to create rule:', err)
    return createErrorResponse('Failed to create rule', 500)
  }
}
