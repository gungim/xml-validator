"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  // Extract workspaceId from pathname (e.g., /workspaces/123/... -> 123)
  const workspaceIdMatch = pathname.match(/\/workspaces\/([^\/]+)/);
  const workspaceId = workspaceIdMatch ? workspaceIdMatch[1] : null;

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
    },
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gray-50/40">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">XML Validator</h1>
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
