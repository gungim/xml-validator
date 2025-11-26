"use client";

import Link from "next/link";
import { useProjects } from "../../lib/hooks/projects";
import { CreateProjectDialog } from "./create-project-dialog";

interface ProjectListProps {
  workspace_id: string;
}
export default function ProjectList({ workspace_id }: ProjectListProps) {
  const { data: projects } = useProjects(workspace_id);
  
  return (
    <div className="space-y-4">
      <CreateProjectDialog workspaceId={workspace_id} />
      
      {projects?.length === 0 ? (
        <div>
          <span>Empty</span>
        </div>
      ) : (
        <div className="space-y-2">
          {projects?.map((item) => (
            <div key={item.id} className="p-4 border rounded hover:bg-gray-50">
              <Link href={`/projects/${item.id}`} className="text-blue-600 hover:underline font-medium">
                {item.name}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
