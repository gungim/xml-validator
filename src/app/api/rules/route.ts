import {
  createErrorResponse,
  createSuccessResponse,
} from '../../lib/api/response'
import { prisma } from '../../lib/db'

export async function GET() {
  try {
    const rules = await prisma.rule.findMany({ take: 10 })
    return createSuccessResponse(rules)
  } catch (err) {
    console.error('Failed to fetch rules:', err)
    return createErrorResponse('Failed to fetch rules', 500)
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const rule = await prisma.rule.create({ data })
    return createSuccessResponse(rule)
  } catch (err) {
    console.error('Failed to create rule:', err)
    return createErrorResponse('Failed to create rule', 500)
  }
}
