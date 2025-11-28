import { User } from '@prisma/client'
import {
  AssignPermissionRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UserWithPermissions,
} from '../types/users'

export async function getUsers(
  role?: string
): Promise<{ users: UserWithPermissions[] }> {
  const url = role ? `/api/users?role=${role}` : '/api/users'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function createUser(input: CreateUserRequest): Promise<User> {
  const res = await fetch(`/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create user')
  return res.json()
}

export async function updateUser(
  id: string,
  input: UpdateUserRequest
): Promise<User> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update user')
  return res.json()
}

export async function deleteUser(id: string) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete user')
  return res.json()
}

export async function assignPermission(
  userId: string,
  input: AssignPermissionRequest
) {
  const response = await fetch(`/api/users/${userId}/permissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to assign permission')
  }

  return response.json()
}

export async function removePermission(workspaceId: string, userId: string) {
  const response = await fetch(
    `/api/users/${userId}/permissions?workspaceId=${workspaceId}`,
    { method: 'DELETE' }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to remove permission')
  }
  return response.json()
}
