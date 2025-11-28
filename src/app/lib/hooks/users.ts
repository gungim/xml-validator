import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignPermission,
  createUser,
  deleteUser,
  getUser,
  getUsers,
  removePermission,
  updateUser,
} from '../api/users'
import { usePermissionsContext } from '../contexts/permissions-context'
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

export function useCurrentUser(userId?: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => (userId ? getUser(userId) : Promise.resolve(null)),
    enabled: !!userId,
  })
}

export function usePermissions(workspaceId: string) {
  const { user, isLoading } = usePermissionsContext()

  if (isLoading) {
    return {
      canEdit: false,
      canDelete: false,
      role: null,
      isLoading: true,
    }
  }

  if (!user) {
    return {
      canEdit: false,
      canDelete: false,
      role: null,
      isLoading: false,
    }
  }

  if (user.role === 'ADMIN') {
    return {
      canEdit: true,
      canDelete: true,
      role: 'ADMIN',
      isLoading: false,
    }
  }

  const permission = user.permissions.find(
    (p: { workspaceId: string; permission: string }) =>
      p.workspaceId === workspaceId
  )?.permission

  const canEdit = permission === 'EDIT'
  // Assuming EDIT permission implies delete capability for now, or strictly EDIT
  // If DELETE is a separate permission, check for it. Based on schema, only READ/EDIT.
  const canDelete = permission === 'EDIT'

  return {
    canEdit,
    canDelete,
    role: user.role,
    isLoading: false,
  }
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
