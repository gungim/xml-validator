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
import { Edit } from 'lucide-react'
import { useState } from 'react'
import { useUpdateGlobalRule } from '../../lib/hooks/global-rules'
import type { NumberCondition, StringCondition } from '../../lib/types/rules'
import { NumberConditionInput } from './rule-form/number-condition-input'
import { StringConditionInput } from './rule-form/string-condition-input'

interface EditGlobalRuleDialogProps {
  globalRule: any
  workspaceId: string
}

export function EditGlobalRuleDialog({
  globalRule,
  workspaceId,
}: EditGlobalRuleDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    mutateAsync: updateGlobalRule,
    isPending,
    error,
  } = useUpdateGlobalRule()

  const dataTypes = ['string', 'number', 'boolean', 'object', 'array']

  // Initialize state from existing global rule
  const [name, setName] = useState(globalRule.name)
  const [description, setDescription] = useState(globalRule.description || '')
  const [dataType, setDataType] = useState(globalRule.dataType)

  const condition = globalRule.condition as any
  const [stringCondition, setStringCondition] = useState<
    Partial<StringCondition>
  >({
    maxLength: condition.maxLength,
    minLength: condition.minLength,
    allowEmpty: condition.allowEmpty ?? true,
    pattern: condition.pattern,
  })
  const [numberCondition, setNumberCondition] = useState<
    Partial<NumberCondition>
  >({
    min: condition.min,
    max: condition.max,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Build condition based on dataType
    let updatedCondition = {}
    if (dataType === 'string') {
      updatedCondition = {
        maxLength: stringCondition.maxLength,
        minLength: stringCondition.minLength,
        allowEmpty: stringCondition.allowEmpty ?? true,
        pattern: stringCondition.pattern,
      }
    } else if (dataType === 'number') {
      updatedCondition = {
        min: numberCondition.min,
        max: numberCondition.max,
      }
    }

    updateGlobalRule({
      id: globalRule.id,
      input: {
        name,
        description: description || undefined,
        dataType,
        condition: updatedCondition,
      },
    }).then(() => {
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
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
              onChange={e => setName(e.target.value)}
              placeholder="e.g., EmailValidation"
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Validates email format"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataType">Data Type</Label>
            <select
              id="dataType"
              value={dataType}
              onChange={e => {
                setDataType(e.target.value)
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
          </div>

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
              Failed to update global rule. Please try again.
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
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
