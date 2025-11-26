import NotFound from "../../../components/not-found";
import { prisma } from "../../../lib/db";
import ProjectList from "../../components/project-list";
import { GlobalRulesTable } from "../../components/global-rules-table";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { id },
  });

  if (!workspace) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <div>
            <h1 className="text-3xl font-bold">{workspace.name}</h1>
          </div>
          <div>
            <p className="text-gray-500 mt-1">
              Created {workspace.createdAt.toLocaleDateString()}
            </p>
          </div>

        </div>
      </div>

      <div>
        <ProjectList workspace_id={id} />
      </div>

      <div className="border-t pt-8">
        <GlobalRulesTable workspaceId={id} />
      </div>
    </div>
  );
}
