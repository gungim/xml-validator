import { User } from '@prisma/client'
import {
  AssignPermissionRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UserWithPermissions,
} from '../types/users'
import { ApiSuccessResponse } from './response'

export async function getUsers(
  role?: string
): Promise<ApiSuccessResponse<UserWithPermissions[]>> {
  const url = role ? `/api/users?role=${role}` : '/api/users'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch users')
  const result = await res.json()
  // Wrapped format: {data: users, total: number}
  return result
}

export async function createUser(
  input: CreateUserRequest
): Promise<ApiSuccessResponse<User>> {
  const res = await fetch(`/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create user')
  const result = await res.json()
  return result
}

export async function updateUser(
  id: string,
  input: UpdateUserRequest
): Promise<ApiSuccessResponse<User>> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update user')
  const result = await res.json()
  return result
}

export async function deleteUser(
  id: string
): Promise<ApiSuccessResponse<User>> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete user')
  const result = await res.json()
  return result
}

export async function assignPermission(
  userId: string,
  input: AssignPermissionRequest
): Promise<ApiSuccessResponse<User>> {
  const response = await fetch(`/api/users/${userId}/permissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to assign permission')
  }

  const result = await response.json()
  return result
}

export async function removePermission(
  workspaceId: string,
  userId: string
): Promise<ApiSuccessResponse<User>> {
  const response = await fetch(
    `/api/users/${userId}/permissions?workspaceId=${workspaceId}`,
    { method: 'DELETE' }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to remove permission')
  }
  const result = await response.json()
  return result
}
