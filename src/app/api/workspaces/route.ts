import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";

export type GetWorkspacesResponse = Awaited<
  ReturnType<typeof prisma.workspace.findMany>
>;
export async function GET() {
  try {
    const result = await prisma.workspace.findMany();
    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Failed to fetch workspaces",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await prisma.workspace.create({ data });
    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Failed to create workspace",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name } = await req.json();
    const workspace = await prisma.workspace.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(workspace);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Failed to update workspace",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.workspace.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Failed to delete workspace",
      },
      { status: 500 },
    );
  }
}
