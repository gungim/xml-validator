"use client";

import WorkspaceForm from "./components/workspace-form";
import WorkspaceList from "./components/workspace-list";
import { useWorkspaces } from "../lib/hooks/workspaces";

export default function WorkspacesPage() {
  const { data: workspaces, isLoading } = useWorkspaces();

  const handleSaved = () => {};

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Workspaces</h1>

      <WorkspaceForm onSaved={handleSaved} />

      <WorkspaceList workspaces={workspaces || []} onRefetch={() => {}} />
    </div>
  );
}
