import NotFound from "../../components/not-found";
import { prisma } from "../../lib/db";
import ProjectList from "../components/project-list";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const workspace = await prisma.workspace.findUnique({
    where: { id },
    include: { projects: true }, // lấy kèm projects
  });
  if (!workspace) return <NotFound />;
  return (
    <div>
      <span>{workspace.name}</span>

      <ProjectList workspace_id={id} />
    </div>
  );
}
