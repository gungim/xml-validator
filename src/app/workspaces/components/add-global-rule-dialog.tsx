"use client";

import { useState } from "react";
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
import { useCreateGlobalRule } from "../../lib/hooks/global-rules";
import type { StringCondition, NumberCondition } from "../../lib/types/rules";

const globalRuleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dataType: z.string().min(1, "Data type is required"),
});

interface AddGlobalRuleDialogProps {
  workspaceId: string;
  parentId?: number;
  parentDataType?: "object" | "array";
}

export function AddGlobalRuleDialog({ workspaceId, parentId, parentDataType }: AddGlobalRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const createGlobalRule = useCreateGlobalRule();

  const dataTypes = ["string", "number", "boolean", "object", "array"];

  // Condition state
  const [stringCondition, setStringCondition] = useState<Partial<StringCondition>>({
    allowEmpty: true,
  });
  const [numberCondition, setNumberCondition] = useState<Partial<NumberCondition>>({});

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      dataType: "string",
    },
    onSubmit: async ({ value }) => {
      try {
        // Build condition based on dataType
        let condition = {};
        if (value.dataType === "string") {
          condition = {
            maxLength: stringCondition.maxLength,
            minLength: stringCondition.minLength,
            allowEmpty: stringCondition.allowEmpty ?? true,
            pattern: stringCondition.pattern,
          };
        } else if (value.dataType === "number") {
          condition = {
            min: numberCondition.min,
            max: numberCondition.max,
          };
        }

        await createGlobalRule.mutateAsync({
          name: value.name,
          description: value.description || undefined,
          dataType: value.dataType,
          condition,
          workspaceId,
          parentId,
        });
        setOpen(false);
        form.reset();
        setStringCondition({ allowEmpty: true });
        setNumberCondition({});
      } catch (error) {
        console.error("Failed to create global rule:", error);
      }
    },
  });

  const currentDataType = form.state.values.dataType;
  const isChildRule = parentId !== undefined;

  const buttonLabel = isChildRule ? (
    <span className="text-sm">+ Child</span>
  ) : (
    "Add Global Rule"
  );

  const dialogTitle = isChildRule ? "Add Child Global Rule" : "Add Global Rule";
  const dialogDescription = isChildRule
    ? (parentDataType === "array"
      ? "Add a child global rule for array items (max 1 allowed)."
      : "Add a child global rule for this object field.")
    : "Create a reusable validation rule template for this workspace.";

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
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = globalRuleSchema.shape.name.safeParse(value);
                if (!result.success) {
                  return result.error.issues[0].message;
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., EmailValidation"
                  disabled={createGlobalRule.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description (Optional)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., Validates email format"
                  disabled={createGlobalRule.isPending}
                />
              </div>
            )}
          </form.Field>

          <form.Field
            name="dataType"
            validators={{
              onChange: ({ value }) => {
                const result = globalRuleSchema.shape.dataType.safeParse(value);
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
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    setStringCondition({ allowEmpty: true });
                    setNumberCondition({});
                  }}
                  disabled={createGlobalRule.isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {dataTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]}
                  </p>
                )}
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
                    disabled={createGlobalRule.isPending}
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
                    disabled={createGlobalRule.isPending}
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
                  placeholder="e.g., ^[a-zA-Z0-9@.]+$"
                  disabled={createGlobalRule.isPending}
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
                  disabled={createGlobalRule.isPending}
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
                  <Label htmlFor="min">Min Value</Label>
                  <Input
                    id="min"
                    type="number"
                    value={numberCondition.min ?? ""}
                    onChange={(e) => setNumberCondition({
                      ...numberCondition,
                      min: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="e.g., 0"
                    disabled={createGlobalRule.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max">Max Value</Label>
                  <Input
                    id="max"
                    type="number"
                    value={numberCondition.max ?? ""}
                    onChange={(e) => setNumberCondition({
                      ...numberCondition,
                      max: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="e.g., 100"
                    disabled={createGlobalRule.isPending}
                  />
                </div>
              </div>
            </div>
          )}

          {createGlobalRule.isError && (
            <p className="text-sm text-red-500">
              Failed to create global rule. Please try again.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createGlobalRule.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createGlobalRule.isPending}>
              {createGlobalRule.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
