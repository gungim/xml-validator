"use client";

import Link from "next/link";
import { useProjects } from "../../lib/hooks/projects";
import { CreateProjectDialog } from "./create-project-dialog";

interface ProjectListProps {
  workspace_id: string;
}
export default function ProjectList({ workspace_id }: ProjectListProps) {
  console.log("workspace_id", workspace_id);
  const { data: projects } = useProjects(workspace_id);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Projects</h2>
        <CreateProjectDialog workspaceId={workspace_id} />
      </div>
      
      {projects?.length === 0 ? (
        <div>
          <span>Empty</span>
        </div>
      ) : (
        <div className="space-y-2">
          {projects?.map((item) => (
            <div key={item.id} className="p-4 border rounded hover:bg-gray-50 space-y-1">
              <Link
                href={`/workspaces/${workspace_id}/projects/${item.id}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {item.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                Endpoint: <code>/api/validate/{item.endpointSlug}</code>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
