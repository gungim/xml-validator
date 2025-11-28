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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loading } from '@/src/app/components/loading'
import { useForm } from '@tanstack/react-form'
import { Edit } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useRule, useUpdateRule } from '../../../../lib/hooks/rules'
import type {
  NumberCondition,
  StringCondition,
} from '../../../../lib/types/rules'
import { NumberConditionInput } from '../../../components/rule-form/number-condition-input'
import { StringConditionInput } from '../../../components/rule-form/string-condition-input'

const ruleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  path: z.string().min(1, 'Path is required'),
  dataType: z.string().min(1, 'Data type is required'),
  required: z.boolean(),
})

interface EditRuleDialogProps {
  ruleId: number
}

export function EditRuleDialog({ ruleId }: EditRuleDialogProps) {
  const [open, setOpen] = useState(false)
  const { data: rule, isLoading } = useRule(ruleId)
  const { mutateAsync: updateRule, isPending, error } = useUpdateRule()
  console.log(rule)
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

  const [conditionError, setConditionError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      path: '',
      dataType: 'string',
      required: false,
      description: '',
    },
    onSubmit: async ({ value }) => {
      setConditionError(null)

      // If linked to global rule, only send path
      if (isLinkedToGlobalRule) {
        updateRule({
          id: ruleId,
          data: {
            path: value.path,
          },
        }).then(() => {
          setOpen(false)
          setConditionError(null)
        })
        return
      }

      // Build condition based on dataType
      let condition = {}
      if (value.dataType === 'string') {
        // Validate string conditions
        if (
          stringCondition.minLength !== undefined &&
          stringCondition.maxLength !== undefined
        ) {
          if (stringCondition.minLength > stringCondition.maxLength) {
            setConditionError('Min length cannot be greater than max length')
            return
          }
        }

        condition = {
          maxLength: stringCondition.maxLength,
          minLength: stringCondition.minLength,
          allowEmpty: stringCondition.allowEmpty ?? true,
          pattern: stringCondition.pattern,
        }
      } else if (value.dataType === 'number') {
        // Validate number conditions
        if (
          numberCondition.min !== undefined &&
          numberCondition.max !== undefined
        ) {
          if (numberCondition.min > numberCondition.max) {
            setConditionError('Min value cannot be greater than max value')
            return
          }
        }

        condition = {
          min: numberCondition.min,
          max: numberCondition.max,
        }
      }

      updateRule({
        id: ruleId,
        data: {
          name: value.name,
          path: value.path,
          dataType: value.dataType,
          required: value.required,
          description: value.description || null,
          condition,
        },
      }).then(() => {
        setOpen(false)
        setConditionError(null)
      })
    },
  })

  // Update form when rule data is loaded
  useEffect(() => {
    if (rule && rule.data && open) {
      form.setFieldValue('name', rule.data.name)
      form.setFieldValue('path', rule.data.path)
      form.setFieldValue('dataType', rule.data.dataType)
      form.setFieldValue('required', rule.data.required)
      form.setFieldValue('description', rule.data.description || '')

      // Set conditions
      const condition = rule.data.condition as any
      if (rule.data.dataType === 'string') {
        setStringCondition({
          maxLength: condition.maxLength,
          minLength: condition.minLength,
          allowEmpty: condition.allowEmpty ?? true,
          pattern: condition.pattern,
        })
      } else if (rule.data.dataType === 'number') {
        setNumberCondition({
          min: condition.min,
          max: condition.max,
        })
      }
    }
  }, [rule, open])

  const currentDataType = form.state.values.dataType
  const hasChildren = rule?.data.children && rule.data.children.length > 0
  const isLinkedToGlobalRule = rule?.data?.globalRuleId !== null

  // Cannot change dataType if rule has children
  const canChangeDataType = !hasChildren

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Rule</DialogTitle>
          <DialogDescription>
            Update the validation rule settings.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Loading />
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-4"
          >
            {hasChildren && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                ⚠️ This rule has child rules. Data type cannot be changed.
              </div>
            )}

            {isLinkedToGlobalRule && (
              <div className="p-3 bg-blue-50 border border-blue-300 rounded text-sm text-blue-900">
                🌐 This rule is linked to a global rule.
                <br />
                <strong>Only the Path can be edited.</strong> To modify other
                fields:
                <ul className="list-disc ml-5 mt-1">
                  <li>
                    Detach from global rule using the "Detach" button in the
                    rules table, or
                  </li>
                  <li>
                    Edit the global rule itself (changes will cascade to all
                    linked rules)
                  </li>
                </ul>
              </div>
            )}

            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const result = ruleSchema.shape.name.safeParse(value)
                  if (!result.success) {
                    return result.error.issues[0].message
                  }
                  return undefined
                },
              }}
            >
              {field => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Rule Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder="Enter rule name"
                    disabled={isPending || isLinkedToGlobalRule}
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
                  const result = ruleSchema.shape.path.safeParse(value)
                  if (!result.success) {
                    return result.error.issues[0].message
                  }
                  return undefined
                },
              }}
            >
              {field => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Path</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder="e.g., user.email"
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

            <form.Field
              name="dataType"
              validators={{
                onChange: ({ value }) => {
                  const result = ruleSchema.shape.dataType.safeParse(value)
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
                  <Select
                    value={field.state.value}
                    onValueChange={value => {
                      field.handleChange(value)
                      // Reset conditions when dataType changes
                      setStringCondition({ allowEmpty: true })
                      setNumberCondition({})
                    }}
                    disabled={
                      isPending || !canChangeDataType || isLinkedToGlobalRule
                    }
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map(type => (
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
              {field => (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    checked={field.state.value}
                    onChange={e => field.handleChange(e.target.checked)}
                    disabled={isPending || isLinkedToGlobalRule}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={field.name} className="cursor-pointer">
                    Required field
                  </Label>
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
                    onChange={e => field.handleChange(e.target.value)}
                    placeholder="Optional description"
                    disabled={isPending || isLinkedToGlobalRule}
                  />
                </div>
              )}
            </form.Field>

            {/* String Conditions */}
            {currentDataType === 'string' && (
              <StringConditionInput
                condition={stringCondition}
                onChange={setStringCondition}
                disabled={isPending || isLinkedToGlobalRule}
              />
            )}

            {/* Number Conditions */}
            {currentDataType === 'number' && (
              <NumberConditionInput
                condition={numberCondition}
                onChange={setNumberCondition}
                disabled={isPending || isLinkedToGlobalRule}
              />
            )}

            {conditionError && (
              <p className="text-sm text-red-500">{conditionError}</p>
            )}

            {error && (
              <p className="text-sm text-red-500">
                Failed to update rule. Please try again.
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
                {isPending ? 'Updating...' : 'Update Rule'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
