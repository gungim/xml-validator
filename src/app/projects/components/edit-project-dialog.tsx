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
import { useUpdateProject } from "../../lib/hooks/projects";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").trim(),
  description: z.string().optional(),
});

interface EditProjectDialogProps {
  projectId: string;
  currentName: string;
  currentDescription?: string | null;
}

export function EditProjectDialog({
  projectId,
  currentName,
  currentDescription,
}: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const updateProject = useUpdateProject();

  const form = useForm({
    defaultValues: {
      name: currentName,
      description: currentDescription || "",
    },
    onSubmit: async ({ value }) => {
      try {
        await updateProject.mutateAsync({
          projectId,
          input: {
            name: value.name,
            description: value.description || undefined,
          },
        });
        setOpen(false);
      } catch (error) {
        console.error("Failed to update project:", error);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update your project information.
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
                const result = projectSchema.shape.name.safeParse(value);
                if (!result.success) {
                  return result.error.issues[0].message;
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Project Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={updateProject.isPending}
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
                  placeholder="Enter project description"
                  disabled={updateProject.isPending}
                />
              </div>
            )}
          </form.Field>

          {updateProject.isError && (
            <p className="text-sm text-red-500">
              Failed to update project. Please try again.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateProject.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProject.isPending}>
              {updateProject.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
