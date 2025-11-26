import { prisma } from "@/src/app/lib/db";
import { validateXml } from "@/src/app/lib/validation/xml-validator";
import { Rule } from "@/src/app/lib/types/rules";

export async function runProjectValidation(projectId: string, xml: string) {
  const rules = await prisma.rule.findMany({
    where: { projectId },
    include: {
      children: true, // If we need to handle nested rules later, but for now flat list is fine if paths are absolute
    },
  });

  if (rules.length === 0) {
    throw new Error("No rules configured for this project");
  }

  // Cast to our Rule type which matches Prisma payload mostly
  const validationResult = validateXml(xml, rules as unknown as Rule[]);
  
  return validationResult;
}

