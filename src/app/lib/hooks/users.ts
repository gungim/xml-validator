import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignPermission,
  createUser,
  deleteUser,
  getUsers,
  removePermission,
  updateUser,
} from '../api/users'
import {
  AssignPermissionRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from '../types/users'

export function useUsers() {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserRequest) => createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },
  })
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateUserRequest) => updateUser(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },
  })
}

export function useAssignPermission(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AssignPermissionRequest) => assignPermission(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },
  })
}

export function useRemovePermission(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workspaceId: string) => removePermission(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      })
    },
  })
}
