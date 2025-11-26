import { Prisma } from "@prisma/client";

// Base rule type from Prisma
type PrismaRule = Prisma.RuleGetPayload<object>;

// Recursive type for rules with children
export type RuleWithChildren = PrismaRule & {
  children?: RuleWithChildren[];
};

export type Rule = RuleWithChildren;

// Use the recursive type for API responses
export type GetRulesResponse = RuleWithChildren[];

export type CreateRuleInput = {
  name: string;
  path: string;
  required: boolean;
  dataType: string;
  description?: string;
  condition?: any;
  projectId: string;
  parentId?: number;
};

export type CreateRuleResponse = RuleWithChildren;
