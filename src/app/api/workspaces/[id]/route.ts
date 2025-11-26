import { prisma } from "@/src/app/lib/db";
import { NextResponse } from "next/server";

export type GetWorkspaceDetailResponse = Awaited<
  ReturnType<typeof prisma.workspace.findUnique>
>;
export async function GET(
) {
 console.log("Dev")
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: "cmhc14k8l0000z43a9r93r1bs"},
      include: { projects: true }, // lấy kèm projects
    });

    if (!workspace)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(workspace);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
