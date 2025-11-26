"use client";

import { useProjects } from "../../lib/hooks/projects";

interface ProjectListProps {
  workspace_id: string;
}
export default function ProjectList({ workspace_id }: ProjectListProps) {
  const { data: projects } = useProjects(workspace_id);
  if (projects?.length === 0)
    return (
      <div>
        <span>Empty</span>
      </div>
    );
  return (
    <div>
      {projects?.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
}
