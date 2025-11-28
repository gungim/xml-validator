'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateUser } from '@/src/app/lib/hooks/users'
import {
  updateUserSchema,
  UserWithPermissions,
} from '@/src/app/lib/types/users'
import { Role } from '@prisma/client'
import { useForm } from '@tanstack/react-form'

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithPermissions | null
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
}: EditUserDialogProps) {
  const {
    mutateAsync: updateUser,
    isPending: isUpdatingUser,
    error,
  } = useUpdateUser(user?.id || '')

  const form = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || Role.USER,
    },
    validators: {
      onSubmit: updateUserSchema,
    },
    onSubmit: async ({ value }) => {
      await updateUser(value).then(() => onOpenChange(false))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <form.Field name="name">
                {field => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={e => field.handleChange(e.target.value)}
                      placeholder="John Doe"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
            <div className="grid gap-2">
              <form.Field name="email">
                {field => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={e => field.handleChange(e.target.value)}
                      placeholder="john@example.com"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
            <div className="grid gap-2">
              <form.Field name="role">
                {field => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Role</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={value => field.handleChange(value as Role)}
                    >
                      <SelectTrigger id="edit-role" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Role.USER}>User</SelectItem>
                        <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-500 mb-4">{error.message}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdatingUser}>
              {isUpdatingUser ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
