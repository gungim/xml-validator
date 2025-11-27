
import { prisma } from "@/src/app/lib/db";
import { CreateRuleInput, GetRulesResponse } from "@/src/app/lib/types/rules";
import { NextRequest, NextResponse } from "next/server";


const VALID_DATA_TYPES = ["string", "number", "boolean", "object", "array"] as const;
type DataTypeValue = typeof VALID_DATA_TYPES[number];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<GetRulesResponse>> {
  const { projectId } = await params;

  const rules = await prisma.rule.findMany({
    where: { projectId },
    include: {
      children: true,
      globalRule: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rules);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  console.log(projectId);
  const body: CreateRuleInput = await request.json();

  // Basic validation
  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    return NextResponse.json(
      { error: "Rule name is required" },
      { status: 400 }
    );
  }

  if (!body.path || typeof body.path !== "string" || body.path.trim().length === 0) {
    return NextResponse.json(
      { error: "Rule path is required" },
      { status: 400 }
    );
  }

  if (!body.dataType || typeof body.dataType !== "string") {
    return NextResponse.json(
      { error: "Data type is required" },
      { status: 400 }
    );
  }

  // Validate dataType is a valid enum value
  if (!VALID_DATA_TYPES.includes(body.dataType as any)) {
    return NextResponse.json(
      { error: `Invalid data type. Must be one of: ${VALID_DATA_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate parent rule if parentId is provided
  if (body.parentId) {
    const parent = await prisma.rule.findUnique({
      where: { id: body.parentId },
      include: { children: true },
    });

    if (!parent) {
      return NextResponse.json(
        { error: "Parent rule not found" },
        { status: 404 }
      );
    }

    if (parent.projectId !== projectId) {
      return NextResponse.json(
        { error: "Parent rule belongs to a different project" },
        { status: 400 }
      );
    }

    // Only object and array types can have children
    if (parent.dataType !== "object" && parent.dataType !== "array") {
      return NextResponse.json(
        { error: "Only object and array rules can have child rules" },
        { status: 400 }
      );
    }

    // Array rules can only have 1 child
    if (parent.dataType === "array" && parent.children.length >= 1) {
      return NextResponse.json(
        { error: "Array rules can only have 1 child rule" },
        { status: 400 }
      );
    }
  }

  // Validate global rule if globalRuleId is provided
  if (body.globalRuleId) {
    const globalRule = await prisma.globalRule.findUnique({
      where: { id: body.globalRuleId },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true, // Support up to 3 levels deep
              },
            },
          },
        },
      },
    });

    if (!globalRule) {
      return NextResponse.json(
        { error: "Global rule not found" },
        { status: 404 }
      );
    }
    
    // Verify data type matches
    if (globalRule.dataType !== body.dataType) {
      return NextResponse.json(
        { error: `Data type mismatch. Global rule is ${globalRule.dataType}, but rule is ${body.dataType}` },
        { status: 400 }
      );
    }

    // Recursive function to create rule with children
    async function createRuleWithChildren(
      globalRuleData: any,
      parentRuleId: number | null,
      parentPath: string
    ): Promise<any> {
      // Create the rule
      const createdRule = await prisma.rule.create({
        data: {
          name: globalRuleData.name,
          path: parentRuleId ? `${parentPath}.${globalRuleData.name}` : body.path.trim(),
          required: body.required ?? false,
          dataType: globalRuleData.dataType,
          description: globalRuleData.description,
          condition: globalRuleData.condition,
          projectId,
          parentId: parentRuleId,
          globalRuleId: globalRuleData.id,
        },
      });

      // Recursively create children if any
      if (globalRuleData.children && globalRuleData.children.length > 0) {
        for (const childGlobalRule of globalRuleData.children) {
          await createRuleWithChildren(
            childGlobalRule,
            createdRule.id,
            createdRule.path
          );
        }
      }

      return createdRule;
    }

    // Create rule and all children recursively
    const rule = await createRuleWithChildren(globalRule, body.parentId || null, body.path);
    return NextResponse.json(rule);
  }

  // Normal rule creation without global rule
  const rule = await prisma.rule.create({
    data: {
      name: body.name.trim(),
      path: body.path.trim(),
      required: body.required ?? false,
      dataType: body.dataType as any,
      description: body.description || null,
      condition: body.condition || {},
      projectId,
      parentId: body.parentId || null,
      globalRuleId: null,
    },
  });

  return NextResponse.json(rule);
}
