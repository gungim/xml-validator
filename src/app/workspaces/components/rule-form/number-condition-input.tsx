'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { NumberCondition } from '../../../lib/types/rules'

interface NumberConditionInputProps {
  condition: Partial<NumberCondition>
  onChange: (condition: Partial<NumberCondition>) => void
  disabled?: boolean
}

export function NumberConditionInput({
  condition,
  onChange,
  disabled = false,
}: NumberConditionInputProps) {
  return (
    <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
      <h4 className="font-medium text-sm">Number Validation</h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="min">Minimum Value</Label>
          <Input
            id="min"
            type="number"
            value={condition.min ?? ''}
            onChange={e =>
              onChange({
                ...condition,
                min: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="e.g., 0"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max">Maximum Value</Label>
          <Input
            id="max"
            type="number"
            value={condition.max ?? ''}
            onChange={e =>
              onChange({
                ...condition,
                max: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="e.g., 100"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
