import {
  createErrorResponse,
  createSuccessResponse,
} from '../../lib/api/response'
import { prisma } from '../../lib/db'

export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany()
    const count = await prisma.workspace.count()
    return createSuccessResponse(workspaces, count)
  } catch (err) {
    console.error('Failed to fetch workspaces:', err)
    return createErrorResponse('Failed to fetch workspaces', 500)
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (
      !data.name ||
      typeof data.name !== 'string' ||
      data.name.trim().length === 0
    ) {
      return createErrorResponse('Workspace name is required', 400)
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: data.name.trim(),
      },
    })
    return createSuccessResponse(workspace)
  } catch (err) {
    console.error('Failed to create workspace:', err)
    return createErrorResponse('Failed to create workspace', 500)
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json()

    if (!id) {
      return createErrorResponse('Workspace ID is required', 400)
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return createErrorResponse('Workspace name is required', 400)
    }

    const workspace = await prisma.workspace.update({
      where: { id },
      data: { name: name.trim() },
    })
    return createSuccessResponse(workspace)
  } catch (err) {
    console.error('Failed to update workspace:', err)
    return createErrorResponse('Failed to update workspace', 500)
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return createErrorResponse('Workspace ID is required', 400)
    }

    await prisma.workspace.delete({ where: { id } })
    return createSuccessResponse(null)
  } catch (err) {
    console.error('Failed to delete workspace:', err)
    return createErrorResponse('Failed to delete workspace', 500)
  }
}
