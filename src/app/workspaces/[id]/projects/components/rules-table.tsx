'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loading } from '@/src/app/components/loading'
import { Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import {
  useDeleteRule,
  useRules,
  useUpdateRule,
} from '../../../../lib/hooks/rules'
import { usePermissions } from '../../../../lib/hooks/users'
import { AddRuleDialog } from './add-rule-dialog'
import { EditRuleDialog } from './edit-rule-dialog'

interface RulesTableProps {
  projectId: string
  workspaceId: string
}

interface Rule {
  id: number
  name: string
  path: string
  required: boolean
  dataType: string
  description: string | null
  parentId: number | null
  children?: Rule[]
  globalRule?: {
    id: number
    name: string
    parentId: number | null
  } | null
}

export function RulesTable({ projectId, workspaceId }: RulesTableProps) {
  const { data: rules, isLoading } = useRules(projectId)
  const deleteRule = useDeleteRule()
  const updateRule = useUpdateRule()
  const { data: session } = useSession()
  const { canEdit, canDelete } = usePermissions(workspaceId, session?.user?.id)

  const handleDelete = async (rule: Rule) => {
    const childCount = rule.children?.length || 0
    const message =
      childCount > 0
        ? `This rule has ${childCount} child rule(s). Deleting it will also delete all children. Continue?`
        : 'Are you sure you want to delete this rule?'

    if (confirm(message)) {
      try {
        await deleteRule.mutateAsync(rule.id)
      } catch (error) {
        console.error('Failed to delete rule:', error)
      }
    }
  }

  const handleDetachGlobalRule = async (rule: Rule) => {
    if (
      confirm(
        `Are you sure you want to detach the global rule "${rule.globalRule?.name}"? This will convert it to a custom rule.`
      )
    ) {
      try {
        await updateRule.mutateAsync({
          id: rule.id,
          data: { globalRuleId: null },
        })
      } catch (error) {
        console.error('Failed to detach global rule:', error)
      }
    }
  }

  if (isLoading) {
    return <Loading />
  }

  // Filter to get only top-level rules (no parent)
  const topLevelRules = rules?.data?.filter(r => r.parentId === null) || []

  if (topLevelRules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No rules yet. Add your first rule to get started.
      </div>
    )
  }

  const canHaveChildren = (dataType: string) => {
    return dataType === 'object' || dataType === 'array'
  }

  const renderRule = (rule: Rule, level: number = 0): React.ReactElement[] => {
    // Find children from the full rules array instead of relying on rule.children
    const children = rules?.data?.filter(r => r.parentId === rule.id) || []
    const hasChildren = children.length > 0
    const indent = level * 32 // 32px per level

    const rows: React.ReactElement[] = []

    // Add the current rule row
    rows.push(
      <TableRow key={rule.id}>
        <TableCell style={{ paddingLeft: `${indent + 16}px` }}>
          <div className="flex items-center gap-2">
            {level > 0 && <span className="text-gray-400">└─</span>}
            <div className="flex flex-col">
              <span>{rule.name}</span>
              {rule.globalRule && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                    🌐 {rule.globalRule.name}
                  </span>
                  {!rule.globalRule.parentId && (
                    <button
                      onClick={() => handleDetachGlobalRule(rule)}
                      className="text-xs text-gray-400 hover:text-red-500 underline"
                      disabled={updateRule.isPending}
                    >
                      Detach
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>{rule.path}</TableCell>
        <TableCell>
          {rule.required ? (
            <span className="text-green-600">✓ Yes</span>
          ) : (
            <span className="text-gray-400">No</span>
          )}
        </TableCell>
        <TableCell>
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            {rule.dataType}
          </code>
        </TableCell>
        <TableCell>{rule.description || '-'}</TableCell>
        <TableCell>
          <div className="flex justify-end gap-2">
            {canEdit && canHaveChildren(rule.dataType) && !rule.globalRule && (
              <AddRuleDialog
                projectId={projectId}
                parentId={rule.id}
                parentDataType={rule.dataType as 'object' | 'array'}
                workspaceId={workspaceId}
              />
            )}

            {canEdit && <EditRuleDialog ruleId={rule.id} />}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(rule)}
                disabled={deleteRule.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {rule.globalRule && (
              <span className="text-xs text-gray-500 italic">
                Linked to global rule
              </span>
            )}
          </div>
        </TableCell>
      </TableRow>
    )

    // Add children rows recursively
    if (hasChildren) {
      children.forEach(child => {
        rows.push(...renderRule(child, level + 1))
      })
    }

    return rows
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Required</TableHead>
            <TableHead>Data Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{topLevelRules.map(rule => renderRule(rule))}</TableBody>
      </Table>
    </div>
  )
}
