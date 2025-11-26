import { prisma } from "../db";

export type GetProjectsResponse = Awaited<
  ReturnType<typeof prisma.project.findMany>
>;

export type CreateProjectInput = {
  name: string;
  workspaceId: string;
};

export type CreateProjectResponse = Awaited<
  ReturnType<typeof prisma.project.create>
>;

export type UpdateProjectInput = {
  name?: string;
  description?: string;
};

export type GetProjectResponse = Awaited<
  ReturnType<typeof prisma.project.findUnique>
>;

