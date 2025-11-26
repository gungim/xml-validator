"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Permission } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { UserWithPermissions } from "@/src/app/lib/types/users";

interface PermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithPermissions | null;
}

export function PermissionsDialog({ open, onOpenChange, user }: PermissionsDialogProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [selectedPermission, setSelectedPermission] = useState<Permission>(Permission.READ);
  const queryClient = useQueryClient();

  // Fetch workspaces
  const { data: workspacesData } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await fetch("/api/workspaces");
      if (!response.ok) throw new Error("Failed to fetch workspaces");
      return response.json();
    },
  });

  const assignPermissionMutation = useMutation({
    mutationFn: async (data: { workspaceId: string; permission: Permission }) => {
      const response = await fetch(`/api/users/${user?.id}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign permission");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedWorkspaceId("");
      setSelectedPermission(Permission.READ);
    },
  });

  const removePermissionMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      const response = await fetch(
        `/api/users/${user?.id}/permissions?workspaceId=${workspaceId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove permission");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleAssignPermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorkspaceId) {
      assignPermissionMutation.mutate({
        workspaceId: selectedWorkspaceId,
        permission: selectedPermission,
      });
    }
  };

  if (!user) return null;

  const workspaces = workspacesData?.workspaces || [];
  const availableWorkspaces = workspaces.filter(
    (ws: any) => !user.permissions.some((p) => p.workspaceId === ws.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Permissions - {user.name}</DialogTitle>
          <DialogDescription>
            Assign workspace permissions to this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Permissions */}
          <div>
            <h3 className="text-sm font-medium mb-3">Current Permissions</h3>
            {user.permissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No permissions assigned yet.
              </p>
            ) : (
              <div className="space-y-2">
                {user.permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {permission.workspace?.name || "Unknown Workspace"}
                      </span>
                      <Badge
                        variant={
                          permission.permission === Permission.EDIT
                            ? "default"
                            : "secondary"
                        }
                      >
                        {permission.permission}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePermissionMutation.mutate(permission.workspaceId)}
                      disabled={removePermissionMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Permission */}
          <div>
            <h3 className="text-sm font-medium mb-3">Add New Permission</h3>
            <form onSubmit={handleAssignPermission} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="workspace">Workspace</Label>
                <Select
                  value={selectedWorkspaceId}
                  onValueChange={setSelectedWorkspaceId}
                >
                  <SelectTrigger id="workspace">
                    <SelectValue placeholder="Select workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWorkspaces.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No available workspaces
                      </div>
                    ) : (
                      availableWorkspaces.map((workspace: any) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="permission">Permission Level</Label>
                <Select
                  value={selectedPermission}
                  onValueChange={(value) => setSelectedPermission(value as Permission)}
                >
                  <SelectTrigger id="permission">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Permission.READ}>Read</SelectItem>
                    <SelectItem value={Permission.EDIT}>Edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {assignPermissionMutation.isError && (
                <p className="text-sm text-red-500">
                  {assignPermissionMutation.error.message}
                </p>
              )}
              <Button
                type="submit"
                disabled={
                  !selectedWorkspaceId ||
                  assignPermissionMutation.isPending ||
                  availableWorkspaces.length === 0
                }
              >
                {assignPermissionMutation.isPending
                  ? "Assigning..."
                  : "Assign Permission"}
              </Button>
            </form>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
