import { NextResponse } from "next/server";

import { prisma } from "@/src/app/lib/db";
import { runProjectValidation } from "./runner";

export async function POST(req: Request) {
  try {
    const { xml, projectId } = await req.json();

    if (typeof xml !== "string" || xml.trim().length === 0) {
      return NextResponse.json(
        { error: "XML payload is required" },
        { status: 400 },
      );
    }

    if (typeof projectId !== "string" || projectId.trim().length === 0) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      );
    }

    const result = await runProjectValidation(project.id, xml);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
