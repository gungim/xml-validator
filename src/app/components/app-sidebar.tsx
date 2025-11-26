"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderKanban, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspaces } from "../lib/hooks/workspaces";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Extract workspaceId from pathname (e.g., /workspaces/123/... -> 123)
  const workspaceIdMatch = pathname.match(/\/workspaces\/([^\/]+)/);
  const workspaceId = workspaceIdMatch ? workspaceIdMatch[1] : null;

  // Fetch workspaces
  const { data: workspaces, isLoading } = useWorkspaces();

  // Find current workspace
  const currentWorkspace = workspaces?.find((ws: any) => ws.id === workspaceId);

  const navigation = [
    {
      name: "Projects",
      href: workspaceId ? `/workspaces/${workspaceId}/projects` : "#",
      icon: FolderKanban,
      disabled: !workspaceId,
    },
    {
      name: "Users",
      href: workspaceId ? `/workspaces/${workspaceId}/users` : "#",
      icon: Users,
      disabled: !workspaceId,
    },
  ];

  const handleWorkspaceChange = (selectedWorkspaceId: string) => {
    router.push(`/workspaces/${selectedWorkspaceId}/projects`);
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50/40">
      {/* Workspace Selector */}
      <div className="flex h-16 items-center border-b px-4">
        <Select
          value={workspaceId || ""}
          onValueChange={handleWorkspaceChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isLoading ? "Loading..." : "Select workspace"}>
              {currentWorkspace ? currentWorkspace.name : "Select workspace"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {workspaces && workspaces.length > 0 ? (
              workspaces.map((workspace: any) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">
                No workspaces available
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                }
              }}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          © 2025 XML Validator
        </p>
      </div>
    </div>
  );
}
