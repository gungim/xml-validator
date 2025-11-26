"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserWithPermissions } from "@/app/lib/types/users";
import { Role } from "@prisma/client";
import { Edit, Trash2, Shield } from "lucide-react";

interface UserListProps {
  users: UserWithPermissions[];
  onEdit: (user: UserWithPermissions) => void;
  onDelete: (user: UserWithPermissions) => void;
  onManagePermissions: (user: UserWithPermissions) => void;
}

export function UserList({ users, onEdit, onDelete, onManagePermissions }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === Role.ADMIN ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {user.role === Role.ADMIN ? (
                  <span className="text-sm text-muted-foreground">Full Access</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.length === 0 ? (
                      <span className="text-sm text-muted-foreground">None</span>
                    ) : (
                      user.permissions.slice(0, 2).map((permission) => (
                        <Badge key={permission.id} variant="outline" className="text-xs">
                          {permission.workspace?.name}: {permission.permission}
                        </Badge>
                      ))
                    )}
                    {user.permissions.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.permissions.length - 2} more
                      </Badge>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {user.role === Role.USER && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onManagePermissions(user)}
                      title="Manage Permissions"
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(user)}
                    title="Edit User"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(user)}
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
