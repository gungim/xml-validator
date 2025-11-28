import { NextRequest, NextResponse } from 'next/server'

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
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401, headers: corsHeaders }
      )
    }

    const project = await prisma.project.findUnique({
      where: { endpointSlug: slug },
      select: { id: true, endpointSecret: true },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Endpoint not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    if (project.endpointSecret !== apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    const xml = await request.text()

    if (xml.trim().length === 0) {
      return NextResponse.json(
        { error: 'XML payload is required' },
        { status: 400, headers: corsHeaders }
      )
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

      return NextResponse.json(result, { headers: corsHeaders })
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

      return NextResponse.json(
        { error: 'Validation failed' },
        { status: 500, headers: corsHeaders }
      )
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500, headers: corsHeaders }
    )
  }
}
