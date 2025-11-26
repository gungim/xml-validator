import { prisma } from "@/src/app/lib/db";
import { GetProjectResponse, UpdateProjectInput } from "@/src/app/lib/types/projects";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<GetProjectResponse>> {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      rules: true,
    },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Project not found" } as any,
      { status: 404 }
    );
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: UpdateProjectInput = await request.json();

  // Validate at least one field is provided
  if (!body.name && !body.description) {
    return NextResponse.json(
      { error: "At least one field (name or description) is required" },
      { status: 400 }
    );
  }

  const updateData: any = {};
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name must be a non-empty string" },
        { status: 400 }
      );
    }
    updateData.name = body.name.trim();
  }
  if (body.description !== undefined) {
    updateData.description = body.description;
  }

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(project);
}
