'use client'

import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { Loading } from '../../components/loading'
import {
  useDeleteGlobalRule,
  useGlobalRules,
} from '../../lib/hooks/global-rules'
import { usePermissions } from '../../lib/hooks/users'
import { AddGlobalRuleDialog } from './add-global-rule-dialog'
import { EditGlobalRuleDialog } from './edit-global-rule-dialog'

interface GlobalRulesTableProps {
  workspaceId: string
}

interface GlobalRule {
  id: number
  name: string
  description: string | null
  dataType: string
  condition: any
  createdAt: Date
  updatedAt: Date
  workspaceId: string
  parentId: number | null
  children?: GlobalRule[]
}

export function GlobalRulesTable({ workspaceId }: GlobalRulesTableProps) {
  const { data: globalRules, isLoading } = useGlobalRules(workspaceId)
  const deleteGlobalRule = useDeleteGlobalRule()
  const { data: session } = useSession()
  const { canEdit, canDelete } = usePermissions(workspaceId, session?.user?.id)

  const handleDelete = async (globalRule: GlobalRule) => {
    const childCount = globalRule.children?.length || 0
    const message =
      childCount > 0
        ? `This global rule has ${childCount} child rule(s). Deleting it will also delete all children. Continue?`
        : 'Are you sure you want to delete this global rule? Rules using it will lose this reference.'

    if (confirm(message)) {
      try {
        await deleteGlobalRule.mutateAsync(globalRule.id)
      } catch (error) {
        console.error('Failed to delete global rule:', error)
      }
    }
  }

  if (isLoading) {
    return <Loading />
  }

  // Filter to get only top-level global rules (no parent)
  const topLevelGlobalRules =
    globalRules?.data?.filter(r => r.parentId === null) || []

  if (topLevelGlobalRules.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Global Rules</h2>
          {canEdit && <AddGlobalRuleDialog workspaceId={workspaceId} />}
        </div>
        <div className="text-center py-8 text-gray-500">
          No global rules yet. Create your first reusable validation rule.
        </div>
      </div>
    )
  }

  const canHaveChildren = (dataType: string) => {
    return dataType === 'object' || dataType === 'array'
  }

  const getConditionSummary = (globalRule: GlobalRule) => {
    const condition = globalRule.condition as any
    let conditionSummary = '-'

    if (globalRule.dataType === 'string') {
      const parts = []
      if (condition.minLength) parts.push(`min: ${condition.minLength}`)
      if (condition.maxLength) parts.push(`max: ${condition.maxLength}`)
      if (condition.pattern) parts.push('pattern')
      if (condition.allowEmpty === false) parts.push('no empty')
      conditionSummary = parts.join(', ') || '-'
    } else if (globalRule.dataType === 'number') {
      const parts = []
      if (condition.min !== undefined) parts.push(`min: ${condition.min}`)
      if (condition.max !== undefined) parts.push(`max: ${condition.max}`)
      conditionSummary = parts.join(', ') || '-'
    }

    return conditionSummary
  }

  const renderGlobalRule = (
    globalRule: GlobalRule,
    level: number = 0
  ): React.ReactElement[] => {
    // Find children from the full array instead of relying on globalRule.children
    const children =
      globalRules?.data?.filter(r => r.parentId === globalRule.id) || []
    const hasChildren = children.length > 0
    const indent = level * 32 // 32px per level

    const rows: React.ReactElement[] = []

    // Add the current global rule row
    rows.push(
      <tr key={globalRule.id} className="border-b hover:bg-gray-50">
        <td className="px-4 py-3" style={{ paddingLeft: `${indent + 16}px` }}>
          <div className="flex items-center gap-2">
            {level > 0 && <span className="text-gray-400">└─</span>}
            <span className="font-medium">{globalRule.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-600">
          {globalRule.description || '-'}
        </td>
        <td className="px-4 py-3">
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            {globalRule.dataType}
          </code>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {getConditionSummary(globalRule)}
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            {canEdit && canHaveChildren(globalRule.dataType) && (
              <AddGlobalRuleDialog
                workspaceId={workspaceId}
                parentId={globalRule.id}
                parentDataType={globalRule.dataType as 'object' | 'array'}
              />
            )}
            {canEdit && (
              <EditGlobalRuleDialog
                globalRule={globalRule}
                workspaceId={workspaceId}
              />
            )}
            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(globalRule)}
                disabled={deleteGlobalRule.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
            )}
          </div>
        </td>
      </tr>
    )

    // Add children rows recursively
    if (hasChildren) {
      children.forEach(child => {
        rows.push(...renderGlobalRule(child, level + 1))
      })
    }

    return rows
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Global Rules</h2>
        {canEdit && <AddGlobalRuleDialog workspaceId={workspaceId} />}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-left font-medium">Data Type</th>
              <th className="px-4 py-3 text-left font-medium">
                Condition Summary
              </th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {topLevelGlobalRules?.map(globalRule =>
              renderGlobalRule(globalRule)
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
