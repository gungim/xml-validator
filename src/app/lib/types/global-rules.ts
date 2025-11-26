import { Prisma } from "@prisma/client";
import type { RuleCondition } from "./rules";

// Base GlobalRule type from Prisma
// import { GlobalRule as PrismaGlobalRule } from "@prisma/client";

export type GlobalRule = {
  id: number;
  name: string;
  description: string | null;
  dataType: string;
  condition: any; // Json type
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
  parentId: number | null;
  children?: GlobalRule[];
};

export type GetGlobalRulesResponse = GlobalRule[];

export type CreateGlobalRuleInput = {
  name: string;
  description?: string;
  dataType: string;
  condition: RuleCondition;
  workspaceId: string;
  parentId?: number;
};

export type UpdateGlobalRuleInput = {
  name?: string;
  description?: string;
  dataType?: string;
  condition?: RuleCondition;
};

export type CreateGlobalRuleResponse = GlobalRule;
export type UpdateGlobalRuleResponse = GlobalRule;
