"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { FieldError, FieldGroup, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateWorkspace } from "../../lib/hooks/workspaces";
import { Button } from "@/components/ui/button";

interface WorkspaceFormProps {
  onSaved: () => void;
}

const userSchema = z.object({
  name: z.string().min(1, "Name must be at least 1 charactors"),
});
export default function WorkspaceForm({ onSaved }: WorkspaceFormProps) {
  const { mutateAsync: createMutate } = useCreateWorkspace();
  const form = useForm({
    defaultValues: { name: "" },
    validators: { onSubmit: userSchema },
    onSubmit: async ({ value }) => {
      createMutate(value).then(() => {
        form.reset();
        onSaved();
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <FieldGroup>
        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Workspace name"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <Button type="submit">Create</Button>
      </FieldGroup>
    </form>
  );
}
