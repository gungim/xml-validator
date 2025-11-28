'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUsers } from '@/src/app/lib/hooks/users'
import { UserWithPermissions } from '@/src/app/lib/types/users'
import { Role } from '@prisma/client'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { AddUserDialog } from './components/add-user-dialog'
import { DeleteUserDialog } from './components/delete-user-dialog'
import { EditUserDialog } from './components/edit-user-dialog'
import { PermissionsDialog } from './components/permissions-dialog'
import { UserList } from './components/user-list'

export default function UsersPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(
    null
  )
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const { data, isLoading, error } = useUsers()

  const handleEdit = (user: UserWithPermissions) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleDelete = (user: UserWithPermissions) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleManagePermissions = (user: UserWithPermissions) => {
    setSelectedUser(user)
    setPermissionsDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by role:</label>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value={Role.ADMIN}>Admin</SelectItem>
              <SelectItem value={Role.USER}>User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">Error loading users</p>
        </div>
      ) : (
        <UserList
          users={data?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManagePermissions={handleManagePermissions}
        />
      )}

      <AddUserDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={selectedUser}
      />

      <PermissionsDialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        user={selectedUser}
      />
    </div>
  )
}
