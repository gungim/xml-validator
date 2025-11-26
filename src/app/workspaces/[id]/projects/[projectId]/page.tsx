import { prisma } from "../../../../lib/db";
import { AddRuleDialog } from "../components/add-rule-dialog";
import NotFound from "../../../../components/not-found";
import { EditProjectDialog } from "../components/edit-project-dialog";
import { RulesTable } from "../components/rules-table";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      rules: true,
      workspace: true, // Include to get workspaceId
    },
  });

  if (!project) {
    return <NotFound />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
          </div>
          <EditProjectDialog
            projectId={projectId}
            currentName={project.name}
            currentDescription={project.description}
            currentSlug={project.endpointSlug}
            workspaceId={project.workspaceId}
            endpointSecret={project.endpointSecret}
          />
        </div>
        <div className="rounded border p-4 bg-muted/40 space-y-1">
          <div className="text-sm font-medium">API Endpoint</div>
          <div className="text-sm">
            URL: <code>/api/validate/{project.endpointSlug}</code>
          </div>
          <p className="text-xs text-muted-foreground">
            Include header <code>X-API-Key</code> with the value shown in the edit
            dialog to validate XML against this project.
          </p>
        </div>
      </div>

      {/* Rules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Rules</h2>
          <AddRuleDialog projectId={projectId} workspaceId={project.workspaceId} />
        </div>

        <div className="bg-white rounded-lg border">
          <RulesTable projectId={projectId} workspaceId={project.workspaceId} />
        </div>
      </div>
    </div>
  );
}
