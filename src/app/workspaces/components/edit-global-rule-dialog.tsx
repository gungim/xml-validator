"use client";

import { useState } from "react";
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
import { useUpdateGlobalRule } from "../../lib/hooks/global-rules";
import type { StringCondition, NumberCondition } from "../../lib/types/rules";

interface EditGlobalRuleDialogProps {
  globalRule: any;
  workspaceId: string;
}

export function EditGlobalRuleDialog({ globalRule, workspaceId }: EditGlobalRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const updateGlobalRule = useUpdateGlobalRule();
  
  const dataTypes = ["string", "number", "boolean", "object", "array"];

  // Initialize state from existing global rule
  const [name, setName] = useState(globalRule.name);
  const [description, setDescription] = useState(globalRule.description || "");
  const [dataType, setDataType] = useState(globalRule.dataType);
  
  const condition = globalRule.condition as any;
  const [stringCondition, setStringCondition] = useState<Partial<StringCondition>>({
    maxLength: condition.maxLength,
    minLength: condition.minLength,
    allowEmpty: condition.allowEmpty ?? true,
    pattern: condition.pattern,
  });
  const [numberCondition, setNumberCondition] = useState<Partial<NumberCondition>>({
    min: condition.min,
    max: condition.max,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Build condition based on dataType
      let updatedCondition = {};
      if (dataType === "string") {
        updatedCondition = {
          maxLength: stringCondition.maxLength,
          minLength: stringCondition.minLength,
          allowEmpty: stringCondition.allowEmpty ?? true,
          pattern: stringCondition.pattern,
        };
      } else if (dataType === "number") {
        updatedCondition = {
          min: numberCondition.min,
          max: numberCondition.max,
        };
      }

      await updateGlobalRule.mutateAsync({
        id: globalRule.id,
        input: {
          name,
          description: description || undefined,
          dataType,
          condition: updatedCondition,
        },
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to update global rule:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Global Rule</DialogTitle>
          <DialogDescription>
            Update this global rule. Changes will affect all rules using it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., EmailValidation"
              disabled={updateGlobalRule.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Validates email format"
              disabled={updateGlobalRule.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataType">Data Type</Label>
            <select
              id="dataType"
              value={dataType}
              onChange={(e) => {
                setDataType(e.target.value);
                setStringCondition({ allowEmpty: true });
                setNumberCondition({});
              }}
              disabled={updateGlobalRule.isPending}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dataTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* String Conditions */}
          {dataType === "string" && (
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
                    disabled={updateGlobalRule.isPending}
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
                    disabled={updateGlobalRule.isPending}
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
                  disabled={updateGlobalRule.isPending}
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
                  disabled={updateGlobalRule.isPending}
                  className="h-4 w-4"
                />
                <Label htmlFor="allowEmpty" className="cursor-pointer">
                  Allow empty string
                </Label>
              </div>
            </div>
          )}

          {/* Number Conditions */}
          {dataType === "number" && (
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
                    disabled={updateGlobalRule.isPending}
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
                    disabled={updateGlobalRule.isPending}
                  />
                </div>
              </div>
            </div>
          )}

          {updateGlobalRule.isError && (
            <p className="text-sm text-red-500">
              Failed to update global rule. Please try again.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateGlobalRule.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateGlobalRule.isPending}>
              {updateGlobalRule.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
