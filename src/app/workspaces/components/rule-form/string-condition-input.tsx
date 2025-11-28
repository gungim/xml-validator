'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { StringCondition } from '../../../lib/types/rules'

interface StringConditionInputProps {
  condition: Partial<StringCondition>
  onChange: (condition: Partial<StringCondition>) => void
  disabled?: boolean
}

export function StringConditionInput({
  condition,
  onChange,
  disabled = false,
}: StringConditionInputProps) {
  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-medium text-sm">String Validation</h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="minLength">Min Length</Label>
          <Input
            id="minLength"
            type="number"
            min="0"
            value={condition.minLength ?? ''}
            onChange={e =>
              onChange({
                ...condition,
                minLength: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="e.g., 5"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxLength">Max Length</Label>
          <Input
            id="maxLength"
            type="number"
            min="0"
            value={condition.maxLength ?? ''}
            onChange={e =>
              onChange({
                ...condition,
                maxLength: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="e.g., 255"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pattern">Regex Pattern</Label>
        <Input
          id="pattern"
          value={condition.pattern ?? ''}
          onChange={e =>
            onChange({
              ...condition,
              pattern: e.target.value || undefined,
            })
          }
          placeholder="e.g., ^[a-zA-Z0-9]+$"
          disabled={disabled}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="allowEmpty"
          checked={condition.allowEmpty ?? true}
          onChange={e =>
            onChange({
              ...condition,
              allowEmpty: e.target.checked,
            })
          }
          disabled={disabled}
          className="h-4 w-4"
        />
        <Label htmlFor="allowEmpty" className="cursor-pointer">
          Allow empty string
        </Label>
      </div>
    </div>
  )
}
