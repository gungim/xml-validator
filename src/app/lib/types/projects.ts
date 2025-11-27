import { Project } from "@prisma/client";
import { prisma } from "../db";

export type ProjectSummary = Pick<
  Project,
  "id" | "name" | "description" | "endpointSlug" | "createdAt" | "updatedAt"
>;

export type GetProjectsResponse = ProjectSummary[];

export type CreateProjectInput = {
  name: string;
  workspaceId: string;
  description?: string;
  endpointSlug: string;
};

export type CreateProjectResponse = Awaited<
  ReturnType<typeof prisma.project.create>
>;

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  endpointSlug?: string;
  regenerateSecret?: boolean;
};

export type GetProjectResponse = Awaited<Project>;
