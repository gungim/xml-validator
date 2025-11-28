'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { z } from 'zod'
import { useCreateGlobalRule } from '../../lib/hooks/global-rules'
import type { NumberCondition, StringCondition } from '../../lib/types/rules'
import { NumberConditionInput } from './rule-form/number-condition-input'
import { StringConditionInput } from './rule-form/string-condition-input'

const globalRuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dataType: z.string().min(1, 'Data type is required'),
})

interface AddGlobalRuleDialogProps {
  workspaceId: string
  parentId?: number
  parentDataType?: 'object' | 'array'
}

export function AddGlobalRuleDialog({
  workspaceId,
  parentId,
  parentDataType,
}: AddGlobalRuleDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    mutateAsync: createGlobalRule,
    data,
    isPending,
    error,
  } = useCreateGlobalRule()

  const dataTypes = ['string', 'number', 'boolean', 'object', 'array']

  // Condition state
  const [stringCondition, setStringCondition] = useState<
    Partial<StringCondition>
  >({
    allowEmpty: true,
  })
  const [numberCondition, setNumberCondition] = useState<
    Partial<NumberCondition>
  >({})

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      dataType: 'string',
    },
    onSubmit: async ({ value }) => {
      try {
        // Build condition based on dataType
        let condition = {}
        if (value.dataType === 'string') {
          condition = {
            maxLength: stringCondition.maxLength,
            minLength: stringCondition.minLength,
            allowEmpty: stringCondition.allowEmpty ?? true,
            pattern: stringCondition.pattern,
          }
        } else if (value.dataType === 'number') {
          condition = {
            min: numberCondition.min,
            max: numberCondition.max,
          }
        }

        createGlobalRule({
          name: value.name,
          description: value.description || undefined,
          dataType: value.dataType,
          condition,
          workspaceId,
          parentId,
        }).then(() => {
          setOpen(false)
          form.reset()
          setStringCondition({ allowEmpty: true })
          setNumberCondition({})
        })
      } catch (error) {
        console.error('Failed to create global rule:', error)
      }
    },
  })

  const dataType = form.state.values.dataType
  const isChildRule = parentId !== undefined

  const buttonLabel = isChildRule ? (
    <span className="text-sm">+ Child</span>
  ) : (
    'Add Global Rule'
  )

  const dialogTitle = isChildRule ? 'Add Child Global Rule' : 'Add Global Rule'
  const dialogDescription = isChildRule
    ? parentDataType === 'array'
      ? 'Add a child global rule for array items (max 1 allowed).'
      : 'Add a child global rule for this object field.'
    : 'Create a reusable validation rule template for this workspace.'

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
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = globalRuleSchema.shape.name.safeParse(value)
                if (!result.success) {
                  return result.error.issues[0].message
                }
                return undefined
              },
            }}
          >
            {field => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="e.g., EmailValidation"
                  disabled={isPending}
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
            {field => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Description (Optional)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  placeholder="e.g., Validates email format"
                  disabled={isPending}
                />
              </div>
            )}
          </form.Field>

          <form.Field
            name="dataType"
            validators={{
              onChange: ({ value }) => {
                const result = globalRuleSchema.shape.dataType.safeParse(value)
                if (!result.success) {
                  return result.error.issues[0].message
                }
                return undefined
              },
            }}
          >
            {field => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Data Type</Label>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => {
                    field.handleChange(e.target.value)
                    setStringCondition({ allowEmpty: true })
                    setNumberCondition({})
                  }}
                  disabled={isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {dataTypes.map(type => (
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
          {dataType === 'string' && (
            <StringConditionInput
              condition={stringCondition}
              onChange={setStringCondition}
              disabled={isPending}
            />
          )}

          {/* Number Conditions */}
          {dataType === 'number' && (
            <NumberConditionInput
              condition={numberCondition}
              onChange={setNumberCondition}
              disabled={isPending}
            />
          )}
          {error && (
            <p className="text-sm text-red-500">
              Failed to create global rule. Please try again.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
