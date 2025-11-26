import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/src/app/lib/db";
import {
  generateProjectSecret,
  normalizeEndpointSlug,
} from "@/src/app/lib/utils/projects";
import { UpdateProjectInput } from "@/src/app/lib/types/projects";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { rules: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const body: UpdateProjectInput = await request.json();
  const updateData: Prisma.ProjectUpdateInput = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name must be a non-empty string" },
        { status: 400 },
      );
    }
    updateData.name = body.name.trim();
  }

  if (body.description !== undefined) {
    updateData.description =
      typeof body.description === "string" && body.description.length > 0
        ? body.description
        : null;
  }

  if (body.endpointSlug !== undefined) {
    if (typeof body.endpointSlug !== "string") {
      return NextResponse.json(
        { error: "Endpoint slug must be a string" },
        { status: 400 },
      );
    }
    try {
      updateData.endpointSlug = normalizeEndpointSlug(body.endpointSlug);
    } catch {
      return NextResponse.json(
        { error: "Endpoint slug is invalid" },
        { status: 400 },
      );
    }
  }

  if (body.regenerateSecret) {
    updateData.endpointSecret = generateProjectSecret();
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields provided" },
      { status: 400 },
    );
  }

  try {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });
    return NextResponse.json(project);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Endpoint slug already exists" },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    );
  }
}

