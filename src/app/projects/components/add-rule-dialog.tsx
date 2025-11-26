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
import { useCreateRule } from "../../lib/hooks/rules";

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
}

export function AddRuleDialog({ projectId, parentId, parentDataType }: AddRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const createRule = useCreateRule();
  
  const isChildRule = parentId !== undefined;
  const dataTypes = ["string", "number", "boolean", "object", "array"];

  const form = useForm({
    defaultValues: {
      name: "",
      path: "",
      dataType: "string",
      required: false,
    },
    onSubmit: async ({ value }) => {
      try {
        await createRule.mutateAsync({
          name: value.name,
          path: value.path,
          dataType: value.dataType,
          required: value.required,
          projectId,
          parentId,
        });
        setOpen(false);
        form.reset();
      } catch (error) {
        console.error("Failed to create rule:", error);
      }
    },
  });

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
      <DialogContent>
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
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={createRule.isPending}
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
