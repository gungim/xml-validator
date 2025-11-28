import {
  createErrorResponse,
  createSuccessResponse,
} from '@/src/app/lib/api/response'
import { prisma } from '@/src/app/lib/db'
import { UpdateGlobalRuleInput } from '@/src/app/lib/types/global-rules'
import { NextRequest } from 'next/server'

const VALID_DATA_TYPES = [
  'string',
  'number',
  'boolean',
  'object',
  'array',
] as const

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const globalRuleId = parseInt(id, 10)
  const body: UpdateGlobalRuleInput = await request.json()

  // Check if global rule exists
  const existing = await prisma.globalRule.findUnique({
    where: { id: globalRuleId },
    include: {
      appliedRules: true, // Include to show count in warning
      children: true,
    },
  })

  if (!existing) {
    return createErrorResponse('Global rule not found', 404)
  }

  // Validate dataType if provided
  if (body.dataType && !VALID_DATA_TYPES.includes(body.dataType as any)) {
    return createErrorResponse(
      `Invalid data type. Must be one of: ${VALID_DATA_TYPES.join(', ')}`,
      400
    )
  }

  // Validate dataType changes - don't allow if has children
  if (body.dataType && body.dataType !== existing.dataType) {
    if (existing.children && existing.children.length > 0) {
      return createErrorResponse(
        'Cannot change data type of a global rule with children',
        400
      )
    }
  }

  // Check for duplicate name if name is being changed
  if (body.name && body.name !== existing.name) {
    const duplicate = await prisma.globalRule.findFirst({
      where: {
        workspaceId: existing.workspaceId,
        name: body.name.trim(),
        id: { not: globalRuleId },
      },
    })

    if (duplicate) {
      return createErrorResponse(
        'A global rule with this name already exists in this workspace',
        400
      )
    }
  }

  const updated = await prisma.globalRule.update({
    where: { id: globalRuleId },
    data: {
      name: body.name?.trim(),
      description: body.description,
      dataType: body.dataType as any,
      condition: body.condition,
    },
  })

  // Cascade updates to all linked rules
  // Find all rules using this global rule
  const linkedRules = await prisma.rule.findMany({
    where: { globalRuleId: globalRuleId },
  })

  // Update each linked rule
  for (const linkedRule of linkedRules) {
    const updateData: any = {
      name: body.name?.trim() ?? linkedRule.name,
      description: body.description ?? linkedRule.description,
      dataType: (body.dataType as any) ?? linkedRule.dataType,
    }

    if (body.condition !== undefined) {
      updateData.condition = body.condition
    }

    await prisma.rule.update({
      where: { id: linkedRule.id },
      data: updateData,
    })
  }

  return createSuccessResponse(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const globalRuleId = parseInt(id, 10)

  // Check if exists
  const existing = await prisma.globalRule.findUnique({
    where: { id: globalRuleId },
  })

  if (!existing) {
    return createErrorResponse('Global rule not found', 404)
  }

  // Delete (cascade SetNull will handle appliedRules)
  await prisma.globalRule.delete({
    where: { id: globalRuleId },
  })

  return createSuccessResponse(null)
}
