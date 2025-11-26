"use client";

import { Button } from "@/components/ui/button";
import { useGlobalRules, useDeleteGlobalRule } from "../../lib/hooks/global-rules";
import { AddGlobalRuleDialog } from "./add-global-rule-dialog";
import { EditGlobalRuleDialog } from "./edit-global-rule-dialog";

interface GlobalRulesTableProps {
  workspaceId: string;
}

export function GlobalRulesTable({ workspaceId }: GlobalRulesTableProps) {
  const { data: globalRules, isLoading } = useGlobalRules(workspaceId);
  const deleteGlobalRule = useDeleteGlobalRule();

  const handleDelete = async (globalRule: any) => {
    // TODO: Query count of rules using this global rule
    const message = "Are you sure you want to delete this global rule? Rules using it will lose this reference.";
    
    if (confirm(message)) {
      try {
        await deleteGlobalRule.mutateAsync(globalRule.id);
      } catch (error) {
        console.error("Failed to delete global rule:", error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading global rules...</div>;
  }

  if (!globalRules || globalRules.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Global Rules</h2>
          <AddGlobalRuleDialog workspaceId={workspaceId} />
        </div>
        <div className="text-center py-8 text-gray-500">
          No global rules yet. Create your first reusable validation rule.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Global Rules</h2>
        <AddGlobalRuleDialog workspaceId={workspaceId} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-left font-medium">Data Type</th>
              <th className="px-4 py-3 text-left font-medium">Condition Summary</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {globalRules.map((globalRule) => {
              const condition = globalRule.condition as any;
              let conditionSummary = "-";
              
              if (globalRule.dataType === "string") {
                const parts = [];
                if (condition.minLength) parts.push(`min: ${condition.minLength}`);
                if (condition.maxLength) parts.push(`max: ${condition.maxLength}`);
                if (condition.pattern) parts.push("pattern");
                if (condition.allowEmpty === false) parts.push("no empty");
                conditionSummary = parts.join(", ") || "-";
              } else if (globalRule.dataType === "number") {
                const parts = [];
                if (condition.min !== undefined) parts.push(`min: ${condition.min}`);
                if (condition.max !== undefined) parts.push(`max: ${condition.max}`);
                conditionSummary = parts.join(", ") || "-";
              }

              return (
                <tr key={globalRule.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{globalRule.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {globalRule.description || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {globalRule.dataType}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {conditionSummary}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <EditGlobalRuleDialog
                        globalRule={globalRule}
                        workspaceId={workspaceId}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(globalRule)}
                        disabled={deleteGlobalRule.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
