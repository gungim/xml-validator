import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/db";
import { GetProjectsResponse } from "../../lib/types/projects";
export async function GET(request: NextRequest) {
    const workspaceId = request.nextUrl.searchParams.get("workspaceId");
    if (!workspaceId) {
        return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
    }
    const projects = await prisma.project.findMany({
        where: {
            workspaceId: workspaceId,
        },
    });
    return NextResponse.json(projects);
}