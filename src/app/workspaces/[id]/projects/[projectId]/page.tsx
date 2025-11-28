import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import NotFound from '../../../../components/not-found'
import { prisma } from '../../../../lib/db'
import { AddRuleDialog } from '../components/add-rule-dialog'
import { EditProjectDialog } from '../components/edit-project-dialog'
import { ImportXMLDialog } from '../components/import-xml-dialog'
import { RulesTable } from '../components/rules-table'
import { TestValidationDialog } from '../components/test-validation-dialog'
import { ValidationLogs } from '../components/validation-logs'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; id: string }>
}) {
  const { projectId, id: workspaceId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      rules: true,
      workspace: true, // Include to get workspaceId
    },
  })

  if (!project) {
    return <NotFound />
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Link href={`/workspaces/${project.workspaceId}/projects`}>
              <div className="flex items-center justify-start">
                <ArrowLeft />
                <h1 className="text-3xl font-bold mb-2 ml-3">{project.name}</h1>
              </div>
            </Link>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <TestValidationDialog
              projectId={projectId}
              endpointSlug={project.endpointSlug}
              endpointSecret={project.endpointSecret}
            />
            <EditProjectDialog
              projectId={projectId}
              currentName={project.name}
              currentDescription={project.description}
              currentSlug={project.endpointSlug}
              workspaceId={project.workspaceId}
              endpointSecret={project.endpointSecret}
            />
          </div>
        </div>
        <div className="rounded border p-4 bg-muted/40 space-y-1">
          <div className="text-sm font-medium">API Endpoint</div>
          <div className="text-sm">
            URL: <code>/api/validate/{project.endpointSlug}</code>
          </div>
          <p className="text-xs text-muted-foreground">
            Include header <code>X-API-Key</code> with the value shown in the
            edit dialog to validate XML against this project.
          </p>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="logs">Validation Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Validation Rules</h2>
            <div className="flex gap-2">
              <ImportXMLDialog
                projectId={projectId}
                workspaceId={workspaceId}
              />
              <AddRuleDialog projectId={projectId} workspaceId={workspaceId} />
            </div>
          </div>

          <RulesTable projectId={projectId} workspaceId={project.workspaceId} />
        </TabsContent>

        <TabsContent value="logs">
          <ValidationLogs projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
