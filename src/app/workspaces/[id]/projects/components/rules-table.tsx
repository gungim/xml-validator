"use client";

import { Button } from "@/components/ui/button";
import { useRules, useDeleteRule, useUpdateRule } from "../../../../lib/hooks/rules";
import { AddRuleDialog } from "./add-rule-dialog";

interface RulesTableProps {
  projectId: string;
  workspaceId: string;
}

interface Rule {
  id: number;
  name: string;
  path: string;
  required: boolean;
  dataType: string;
  description: string | null;
  parentId: number | null;
  children?: Rule[];
  globalRule?: {
    id: number;
    name: string;
  } | null;
}

export function RulesTable({ projectId, workspaceId }: RulesTableProps) {
  const { data: rules, isLoading } = useRules(projectId);
  const deleteRule = useDeleteRule();
  const updateRule = useUpdateRule();

  const handleDelete = async (rule: Rule) => {
    const childCount = rule.children?.length || 0;
    const message = childCount > 0
      ? `This rule has ${childCount} child rule(s). Deleting it will also delete all children. Continue?`
      : "Are you sure you want to delete this rule?";
    
    if (confirm(message)) {
      try {
        await deleteRule.mutateAsync(rule.id);
      } catch (error) {
        console.error("Failed to delete rule:", error);
      }
    }
  };

  const handleDetachGlobalRule = async (rule: Rule) => {
    if (confirm(`Are you sure you want to detach the global rule "${rule.globalRule?.name}"? This will convert it to a custom rule.`)) {
      try {
        await updateRule.mutateAsync({ id: rule.id, data: { globalRuleId: null } });
      } catch (error) {
        console.error("Failed to detach global rule:", error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading rules...</div>;
  }

  // Filter to get only top-level rules (no parent)
  const topLevelRules = rules?.filter(r => r.parentId === null) || [];

  if (topLevelRules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No rules yet. Add your first rule to get started.
      </div>
    );
  }

  const canHaveChildren = (dataType: string) => {
    return dataType === "object" || dataType === "array";
  };

  const renderRule = (rule: Rule, level: number = 0): React.ReactElement[] => {
    const hasChildren = rule.children && rule.children.length > 0;
    const indent = level * 32; // 32px per level

    const rows: React.ReactElement[] = [];

    // Add the current rule row
    rows.push(
      <tr key={rule.id} className="border-b hover:bg-gray-50">
        <td className="px-4 py-3" style={{ paddingLeft: `${indent + 16}px` }}>
          <div className="flex items-center gap-2">
            {level > 0 && (
              <span className="text-gray-400">└─</span>
            )}
            <div className="flex flex-col">
              <span>{rule.name}</span>
              {rule.globalRule && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                    🌐 {rule.globalRule.name}
                  </span>
                  <button
                    onClick={() => handleDetachGlobalRule(rule)}
                    className="text-xs text-gray-400 hover:text-red-500 underline"
                    disabled={updateRule.isPending}
                  >
                    Detach
                  </button>
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 font-mono text-sm">{rule.path}</td>
        <td className="px-4 py-3">
          {rule.required ? (
            <span className="text-green-600">✓ Yes</span>
          ) : (
            <span className="text-gray-400">No</span>
          )}
        </td>
        <td className="px-4 py-3">
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            {rule.dataType}
          </code>
        </td>
        <td className="px-4 py-3 text-gray-600">
          {rule.description || "-"}
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            {canHaveChildren(rule.dataType) && (
              <AddRuleDialog
                projectId={projectId}
                parentId={rule.id}
                parentDataType={rule.dataType as "object" | "array"}
                workspaceId={workspaceId}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(rule)}
              disabled={deleteRule.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </td>
      </tr>
    );

    // Add children rows recursively
    if (hasChildren) {
      rule.children!.forEach(child => {
        rows.push(...renderRule(child, level + 1));
      });
    }

    return rows;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Path</th>
            <th className="px-4 py-3 text-left font-medium">Required</th>
            <th className="px-4 py-3 text-left font-medium">Data Type</th>
            <th className="px-4 py-3 text-left font-medium">Description</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {topLevelRules.map(rule => renderRule(rule))}
        </tbody>
      </table>
    </div>
  );
}
