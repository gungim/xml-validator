"use client";

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
        <div>
          {projects?.map((item) => (
            <div key={item.id}>
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
