import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

const VALID_DATA_TYPES = ["string", "number", "boolean", "object", "array"] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const rule = await prisma.rule.findUnique({
      where: { id: parseInt(id) },
      include: {
        children: true,
        parent: true,
        globalRule: true,
      },
    });

    if (!rule) {
      return NextResponse.json(
        { error: "Rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Failed to fetch rule:", error);
    return NextResponse.json(
      { error: "Failed to fetch rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.rule.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete rule" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    // First fetch the existing rule to validate updates
    const existingRule = await prisma.rule.findUnique({
      where: { id: parseInt(id) },
      include: {
        children: true,
        globalRule: true,
      },
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: "Rule not found" },
        { status: 404 }
      );
    }

    // Prevent editing if rule is linked to a global rule (except for detaching)
    if (existingRule.globalRuleId) {
      // Allow only detaching (setting globalRuleId to null)
      const isDetaching = body.globalRuleId === null;
      const hasOtherEdits = Object.keys(body).some(
        key => key !== 'globalRuleId' && body[key] !== undefined
      );

      if (hasOtherEdits && !isDetaching) {
        return NextResponse.json(
          { error: "Cannot edit rules linked to global rules. Detach from global rule first or edit the global rule itself." },
          { status: 400 }
        );
      }

      // If detaching, allow it
      if (isDetaching) {
        // Just update globalRuleId and nothing else for now
        const updated = await prisma.rule.update({
          where: { id: parseInt(id) },
          data: { globalRuleId: null },
          include: {
            children: true,
            globalRule: true,
          },
        });
        return NextResponse.json(updated);
      }
    }

    // Validate dataType changes
    if (body.dataType && body.dataType !== existingRule.dataType) {
      // Don't allow dataType changes if rule has children
      if (existingRule.children && existingRule.children.length > 0) {
        return NextResponse.json(
          { error: "Cannot change data type of a rule with children" },
          { status: 400 }
        );
      }

      // Validate dataType value
      if (!VALID_DATA_TYPES.includes(body.dataType as any)) {
        return NextResponse.json(
          { error: `Invalid data type. Must be one of: ${VALID_DATA_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Validate global rule if provided
    if (body.globalRuleId !== undefined && body.globalRuleId !== null) {
      const globalRule = await prisma.globalRule.findUnique({
        where: { id: body.globalRuleId },
      });

      if (!globalRule) {
        return NextResponse.json(
          { error: "Global rule not found" },
          { status: 404 }
        );
      }

      // Verify data type matches
      const targetDataType = body.dataType || existingRule.dataType;
      if (globalRule.dataType !== targetDataType) {
        return NextResponse.json(
          { error: `Data type mismatch. Global rule is ${globalRule.dataType}, but rule is ${targetDataType}` },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.path !== undefined) updateData.path = body.path.trim();
    if (body.dataType !== undefined) updateData.dataType = body.dataType;
    if (body.required !== undefined) updateData.required = body.required;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.globalRuleId !== undefined) updateData.globalRuleId = body.globalRuleId;

    // If path is changing and rule has children (object/array), update children paths
    if (body.path && body.path !== existingRule.path && existingRule.children && existingRule.children.length > 0) {
      const oldPath = existingRule.path;
      const newPath = body.path.trim();

      // Recursive function to update child paths
      async function updateChildrenPaths(parentId: number, oldParentPath: string, newParentPath: string) {
        const children = await prisma.rule.findMany({
          where: { parentId },
          include: { children: true },
        });

        for (const child of children) {
          // Replace the old parent path prefix with the new one
          let newChildPath = child.path;
          if (child.path.startsWith(oldParentPath + ".")) {
            newChildPath = child.path.replace(oldParentPath + ".", newParentPath + ".");
          }

          // Update child path
          await prisma.rule.update({
            where: { id: child.id },
            data: { path: newChildPath },
          });

          // Recursively update grandchildren if any
          if (child.children && child.children.length > 0) {
            await updateChildrenPaths(child.id, child.path, newChildPath);
          }
        }
      }

      // Update all descendants
      await updateChildrenPaths(parseInt(id), oldPath, newPath);
    }

    const rule = await prisma.rule.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        children: true,
        globalRule: true,
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Failed to update rule:", error);
    return NextResponse.json(
      { error: "Failed to update rule" },
      { status: 500 }
    );
  }
}
