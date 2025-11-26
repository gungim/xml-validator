import { prisma } from "@/src/app/lib/db";
import { CreateGlobalRuleInput, GetGlobalRulesResponse } from "@/src/app/lib/types/global-rules";
import { NextRequest, NextResponse } from "next/server";


const VALID_DATA_TYPES = ["string", "number", "boolean", "object", "array"] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<GetGlobalRulesResponse>> {
  const { id: workspaceId } = await params;

  const globalRules = await prisma.globalRule.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(globalRules);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params;
  const body: CreateGlobalRuleInput = await request.json();

  // Basic validation
  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json(
      { error: "Global rule name is required" },
      { status: 400 }
    );
  }

  if (!body.dataType || typeof body.dataType !== "string") {
    return NextResponse.json(
      { error: "Data type is required" },
      { status: 400 }
    );
  }

  // Validate dataType
  if (!VALID_DATA_TYPES.includes(body.dataType as any)) {
    return NextResponse.json(
      { error: `Invalid data type. Must be one of: ${VALID_DATA_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // Check for duplicate name within workspace
  const existing = await prisma.globalRule.findFirst({
    where: {
      workspaceId,
      name: body.name.trim(),
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A global rule with this name already exists in this workspace" },
      { status: 400 }
    );
  }

  const globalRule = await prisma.globalRule.create({
    data: {
      name: body.name.trim(),
      description: body.description || null,
      dataType: body.dataType as any,
      condition: body.condition || {},
      workspaceId,
    },
  });

  return NextResponse.json(globalRule);
}
