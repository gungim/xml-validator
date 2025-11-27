import { z } from "zod";
import { Role, Permission } from "@prisma/client";

// Enums from Prisma
export { Role, Permission };

// User entity types
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPermissions extends User {
  permissions: UserPermission[];
}

export interface UserPermission {
  id: string;
  userId: string;
  workspaceId: string;
  permission: Permission;
  createdAt: Date;
  workspace?: {
    id: string;
    name: string;
  };
}

// API Request/Response types
export interface CreateUserRequest {
  name: string;
  email: string;
  role: Role;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: Role;
}

export interface AssignPermissionRequest {
  workspaceId: string;
  permission: Permission;
}

export interface GetUsersResponse {
  users: UserWithPermissions[];
}

export interface GetUserResponse {
  user: UserWithPermissions;
}

// Zod validation schemas
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(Role),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.email().optional(),
  role: z.enum(Role).optional(),
});

export const assignPermissionSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  permission: z.enum(Permission),
});
