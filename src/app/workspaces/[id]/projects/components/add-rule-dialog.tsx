"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateRule } from "../../../../lib/hooks/rules";
import { useGlobalRules } from "../../../../lib/hooks/global-rules";
import type { StringCondition, NumberCondition } from "../../../../lib/types/rules";

const ruleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  path: z.string().min(1, "Path is required"),
  dataType: z.string().min(1, "Data type is required"),
  required: z.boolean(),
});

interface AddRuleDialogProps {
  projectId: string;
  parentId?: number;
  parentDataType?: "object" | "array";
  workspaceId: string;
}

export function AddRuleDialog({ projectId, parentId, parentDataType, workspaceId }: AddRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const createRule = useCreateRule();
  const { data: globalRules } = useGlobalRules(workspaceId);
  
  const isChildRule = parentId !== undefined;
  const dataTypes = ["string", "number", "boolean", "object", "array"];

  // Global rule state
  const [selectedGlobalRuleId, setSelectedGlobalRuleId] = useState<number | null>(null);

  // Condition state
  const [stringCondition, setStringCondition] = useState<Partial<StringCondition>>({
    allowEmpty: true,
  });
  const [numberCondition, setNumberCondition] = useState<Partial<NumberCondition>>({});

  const [conditionError, setConditionError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      path: "",
      dataType: "string",
      required: false,
    },
    onSubmit: async ({ value }) => {
      setConditionError(null);
      try {
        // Build condition based on dataType
        let condition = {};
        if (value.dataType === "string") {
          // Validate string conditions
          if (stringCondition.minLength !== undefined && stringCondition.maxLength !== undefined) {
            if (stringCondition.minLength > stringCondition.maxLength) {
              setConditionError("Min length cannot be greater than max length");
              return;
            }
          }
          
          condition = {
            maxLength: stringCondition.maxLength,
            minLength: stringCondition.minLength,
            allowEmpty: stringCondition.allowEmpty ?? true,
            pattern: stringCondition.pattern,
          };
        } else if (value.dataType === "number") {
          // Validate number conditions
          if (numberCondition.min !== undefined && numberCondition.max !== undefined) {
            if (numberCondition.min > numberCondition.max) {
              setConditionError("Min value cannot be greater than max value");
              return;
            }
          }

          condition = {
            min: numberCondition.min,
            max: numberCondition.max,
          };
        }

        await createRule.mutateAsync({
          name: value.name,
          path: value.path,
          dataType: value.dataType,
          required: value.required,
          condition,
          projectId,
          parentId,
          globalRuleId: selectedGlobalRuleId || undefined,
        });
        setOpen(false);
        form.reset();
        // Reset conditions and global rule
        setStringCondition({ allowEmpty: true });
        setNumberCondition({});
        setSelectedGlobalRuleId(null);
        setConditionError(null);
      } catch (error) {
        console.error("Failed to create rule:", error);
      }
    },
  });

  const currentDataType = form.state.values.dataType;

  const buttonLabel = isChildRule ? (
    <span className="text-sm">+ Child</span>
  ) : (
    "Add Rule"
  );

  const dialogTitle = isChildRule ? "Add Child Rule" : "Add New Rule";
  const dialogDescription = isChildRule
    ? (parentDataType === "array"
        ? "Add a child rule for array items (max 1 allowed)."
        : "Add a child rule for this object field.")
    : "Create a new validation rule for this project.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isChildRule ? (
          <Button variant="outline" size="sm">
            {buttonLabel}
          </Button>
        ) : (
          <Button>{buttonLabel}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {parentDataType === "array" && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              ⚠️ Array rules can only have 1 child rule.
            </div>
          )}

          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = ruleSchema.shape.name.safeParse(value);
                if (!result.success) {
                  return result.error.issues[0].message;
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Rule Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter rule name"
                  disabled={createRule.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="path"
            validators={{
              onChange: ({ value }) => {
                const result = ruleSchema.shape.path.safeParse(value);
                if (!result.success) {
                  return result.error.issues[0].message;
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Path</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., user.email"
                  disabled={createRule.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Global Rule Selector */}
          {globalRules && globalRules.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="globalRule">Apply Global Rule (Optional)</Label>
              <Select
                value={selectedGlobalRuleId?.toString() || ""}
                onValueChange={(value) => {
                  const id = value ? Number(value) : null;
                  setSelectedGlobalRuleId(id);
                  
                  if (id) {
                    const rule = globalRules.find(r => r.id === id);
                    if (rule) {
                      // Auto-populate and lock fields
                      form.setFieldValue("dataType", rule.dataType);
                      
                      const condition = rule.condition as any;
                      if (rule.dataType === "string") {
                        setStringCondition({
                          maxLength: condition.maxLength,
                          minLength: condition.minLength,
                          allowEmpty: condition.allowEmpty ?? true,
                          pattern: condition.pattern,
                        });
                      } else if (rule.dataType === "number") {
                        setNumberCondition({
                          min: condition.min,
                          max: condition.max,
                        });
                      }
                    }
                  } else {
                    // Reset to default or keep current? 
                    // Let's keep current but allow editing
                  }
                }}
                disabled={createRule.isPending}
              >
                <SelectTrigger id="globalRule" className="w-full">
                  <SelectValue placeholder="None (Custom Rule)" />
                </SelectTrigger>
                <SelectContent>
                  {globalRules.map((rule) => (
                    <SelectItem key={rule.id} value={rule.id.toString()}>
                      {rule.name} ({rule.dataType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedGlobalRuleId && (
                <p className="text-xs text-blue-600">
                  ℹ️ Applying a global rule locks the data type and validation conditions.
                </p>
              )}
            </div>
          )}

          <form.Field
            name="dataType"
            validators={{
              onChange: ({ value }) => {
                const result = ruleSchema.shape.dataType.safeParse(value);
                if (!result.success) {
                  return result.error.issues[0].message;
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Data Type</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    // Reset conditions when dataType changes
                    setStringCondition({ allowEmpty: true });
                    setNumberCondition({});
                  }}
                  disabled={createRule.isPending || selectedGlobalRuleId !== null}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="required">
            {(field) => (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={field.name}
                  name={field.name}
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  disabled={createRule.isPending}
                  className="h-4 w-4"
                />
                <Label htmlFor={field.name} className="cursor-pointer">
                  Required field
                </Label>
              </div>
            )}
          </form.Field>

          {/* String Conditions */}
          {currentDataType === "string" && (
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium text-sm">String Validation</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Min Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    min="0"
                    value={stringCondition.minLength ?? ""}
                    onChange={(e) => setStringCondition({
                      ...stringCondition,
                      minLength: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="e.g., 5"
                    disabled={createRule.isPending || selectedGlobalRuleId !== null}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxLength">Max Length</Label>
                  <Input
                    id="maxLength"
                    type="number"
                    min="0"
                    value={stringCondition.maxLength ?? ""}
                    onChange={(e) => setStringCondition({
                      ...stringCondition,
                      maxLength: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="e.g., 255"
                    disabled={createRule.isPending || selectedGlobalRuleId !== null}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern">Regex Pattern</Label>
                <Input
                  id="pattern"
                  value={stringCondition.pattern ?? ""}
                  onChange={(e) => setStringCondition({
                    ...stringCondition,
                    pattern: e.target.value || undefined
                  })}
                  placeholder="e.g., ^[a-zA-Z0-9]+$"
                  disabled={createRule.isPending || selectedGlobalRuleId !== null}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowEmpty"
                  checked={stringCondition.allowEmpty ?? true}
                  onChange={(e) => setStringCondition({
                    ...stringCondition,
                    allowEmpty: e.target.checked
                  })}
                  disabled={createRule.isPending || selectedGlobalRuleId !== null}
                  className="h-4 w-4"
                />
                <Label htmlFor="allowEmpty" className="cursor-pointer">
                  Allow empty string
                </Label>
              </div>
            </div>
          )}

          {/* Number Conditions */}
          {currentDataType === "number" && (
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium text-sm">Number Validation</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="min">Minimum Value</Label>
                  <Input
                    id="min"
                    type="number"
                    value={numberCondition.min ?? ""}
                    onChange={(e) => setNumberCondition({
                      ...numberCondition,
                      min: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="e.g., 0"
                    disabled={createRule.isPending || selectedGlobalRuleId !== null}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max">Maximum Value</Label>
                  <Input
                    id="max"
                    type="number"
                    value={numberCondition.max ?? ""}
                    onChange={(e) => setNumberCondition({
                      ...numberCondition,
                      max: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="e.g., 100"
                    disabled={createRule.isPending || selectedGlobalRuleId !== null}
                  />
                </div>
              </div>
            </div>
          )}

          {conditionError && (
            <p className="text-sm text-red-500">
              {conditionError}
            </p>
          )}

          {createRule.isError && (
            <p className="text-sm text-red-500">
              Failed to create rule. Please try again.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createRule.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRule.isPending}>
              {createRule.isPending ? "Creating..." : "Create Rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
