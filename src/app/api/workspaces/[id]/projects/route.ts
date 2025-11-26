import { prisma } from "@/src/app/lib/db";
import { NextResponse } from "next/server";

export type GetProjectsResponse = Awaited<
  ReturnType<typeof prisma.project.findMany>
>;
export async function GET() {
  try {
    const result = await prisma.project.findMany();
    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Failed to fetch project",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await prisma.project.create({ data });
    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Failed to create project",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json();
    const project = await prisma.project.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(project);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Failed to update project",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Failed to delete project",
      },
      { status: 500 },
    );
  }
}
