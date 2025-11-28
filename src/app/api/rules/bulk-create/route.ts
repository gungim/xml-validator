import { NextRequest, NextResponse } from 'next/server'
import {
  createErrorResponse,
  createSuccessResponse,
} from '../../../lib/api/response'
import { prisma } from '../../../lib/db'

export interface BulkCreateRuleInput {
  name: string
  path: string
  dataType: string
  required: boolean
  description?: string
  condition: any
  parentPath?: string
}

export interface BulkCreateRequest {
  projectId: string
  rules: BulkCreateRuleInput[]
  parentId?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkCreateRequest = await request.json()
    const { projectId, rules, parentId: rootParentId } = body

    if (!projectId || !rules || rules.length === 0) {
      return createErrorResponse('Project ID and rules are required', 400)
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return createErrorResponse('Project not found', 404)
    }

    // Create a map to store created rule IDs by path
    const createdRuleIds = new Map<string, number>()

    // Sort rules to ensure parents are created before children
    const sortedRules = [...rules].sort((a, b) => {
      const aDepth = a.path.split('/').length
      const bDepth = b.path.split('/').length
      return aDepth - bDepth
    })

    // Create rules in a transaction
    const createdRules = await prisma.$transaction(async tx => {
      const results = []

      for (const ruleInput of sortedRules) {
        // Find parent ID if parentPath is specified
        let parentId: number | null = null
        if (ruleInput.parentPath) {
          parentId = createdRuleIds.get(ruleInput.parentPath) || null
        } else if (rootParentId) {
          // If no internal parent path, use the provided root parent ID
          parentId = rootParentId
        }

        // Create the rule
        const createdRule = await tx.rule.create({
          data: {
            name: ruleInput.name,
            path: ruleInput.path,
            dataType: ruleInput.dataType as any,
            required: ruleInput.required,
            description: ruleInput.description || null,
            condition: ruleInput.condition,
            projectId,
            parentId,
          },
        })

        // Store the created rule ID for children to reference
        createdRuleIds.set(ruleInput.path, createdRule.id)
        results.push(createdRule)
      }

      return results
    })

    return NextResponse.json(
      createSuccessResponse(createdRules, createdRules.length),
      { status: 201 }
    )
  } catch (error) {
    console.error('Error bulk creating rules:', error)
    return createErrorResponse('Failed to create rules', 500)
  }
}
