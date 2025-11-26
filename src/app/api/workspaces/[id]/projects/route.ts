import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/src/app/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: workspaceId } = await params;

  if (!workspaceId) {
    return NextResponse.json(
      { error: "Missing workspaceId" },
      { status: 400 },
    );
  }

  const projects = await prisma.project.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      endpointSlug: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(projects);
}