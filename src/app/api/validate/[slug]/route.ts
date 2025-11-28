import { NextRequest, NextResponse } from 'next/server'

import {
  createErrorResponse,
  createSuccessResponse,
} from '@/src/app/lib/api/response'
import { prisma } from '@/src/app/lib/db'
import { runProjectValidation } from '../runner'

const API_KEY_HEADER = 'x-api-key'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  }

  try {
    const { slug } = await params
    const apiKey = request.headers.get(API_KEY_HEADER)
    if (!apiKey) {
      return createErrorResponse('Missing API key', 401)
    }

    const project = await prisma.project.findUnique({
      where: { endpointSlug: slug },
      select: { id: true, endpointSecret: true },
    })

    if (!project) {
      return createErrorResponse('Endpoint not found', 404)
    }

    if (project.endpointSecret !== apiKey) {
      return createErrorResponse('Unauthorized', 401)
    }

    const xml = await request.text()

    if (xml.trim().length === 0) {
      return createErrorResponse('XML payload is required', 400)
    }

    // Get IP address
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    try {
      const result = await runProjectValidation(project.id, xml)

      // Log success
      await prisma.validationLog.create({
        data: {
          ip,
          status: 'SUCCESS',
          projectId: project.id,
        },
      })

      return createSuccessResponse(result)
    } catch (err) {
      console.error(err)

      // Log failure
      await prisma.validationLog.create({
        data: {
          ip,
          status: 'FAILURE',
          error: err instanceof Error ? err.message : 'Unknown error',
          projectId: project.id,
        },
      })

      return createErrorResponse('Validation failed', 500)
    }
  } catch (err) {
    console.error(err)
    return createErrorResponse('Validation failed', 500)
  }
}
