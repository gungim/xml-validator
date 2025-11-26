import { Prisma } from "@prisma/client";

// Condition types for different data types
export type StringCondition = {
  maxLength?: number;
  minLength?: number;
  allowEmpty?: boolean;
  pattern?: string; // regex pattern
};

export type NumberCondition = {
  min?: number;
  max?: number;
};

// Union type for all conditions
export type RuleCondition = StringCondition | NumberCondition | Record<string, never>;

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
  condition?: RuleCondition;
  projectId: string;
  parentId?: number;
  globalRuleId?: number;
};

export type CreateRuleResponse = RuleWithChildren;
