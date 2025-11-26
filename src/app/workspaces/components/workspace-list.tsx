"use client";

import { Button } from "@/components/ui/button";
import { GetWorkspacesResponse } from "../../api/workspaces/route";
import Link from "next/link";

interface WorkspaceListProps {
  workspaces: GetWorkspacesResponse;
  onRefetch: () => void;
}

export default function WorkspaceList({
  workspaces,
  onRefetch,
}: WorkspaceListProps) {
  if (!workspaces.length)
    return <p className="text-gray-500 text-sm">No workspaces yet.</p>;

  return (
    <ul className="divide-y border rounded-md">
      {workspaces.map((ws) => (
        <li key={ws.id} className="flex justify-between items-center px-4 py-2">
          <Link href={`/workspaces/${ws.id}`}>
            <span>{ws.name}</span>
          </Link>
          <div className="space-x-2">
            <Button
            // onClick={() => onEdit(ws)}
            >
              Edit
            </Button>
            <Button
            // onClick={() => onDelete(ws.id)}
            >
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
