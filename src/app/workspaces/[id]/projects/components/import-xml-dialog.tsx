'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useBulkCreateRules, useRules } from '@/src/app/lib/hooks/rules'
import { usePermissions } from '@/src/app/lib/hooks/users'
import { ParsedRule, parseXMLToRules } from '@/src/app/lib/utils/xml-parser'
import { FileCode2 } from 'lucide-react'
import { useState } from 'react'
import { NumberConditionInput } from '../../../components/rule-form/number-condition-input'
import { StringConditionInput } from '../../../components/rule-form/string-condition-input'

interface ImportXMLDialogProps {
  projectId: string
  workspaceId: string
}

interface EditedRule {
  condition: any
  required: boolean
}

export function ImportXMLDialog({
  projectId,
  workspaceId,
}: ImportXMLDialogProps) {
  const { canEdit } = usePermissions(workspaceId)
  const [open, setOpen] = useState(false)
  const [xmlInput, setXmlInput] = useState('')
  const [parsedRules, setParsedRules] = useState<ParsedRule[]>([])
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set())
  const [editedRules, setEditedRules] = useState<Map<string, EditedRule>>(
    new Map()
  )
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null)
  const [error, setError] = useState<string>('')
  const [isParsing, setIsParsing] = useState(false)

  const { mutateAsync: bulkCreateRules, isPending } = useBulkCreateRules()
  const { data: rules } = useRules(projectId)

  const handleParse = () => {
    setError('')
    setIsParsing(true)

    try {
      const rules = parseXMLToRules(xmlInput)
      setParsedRules(rules)

      // Select all rules by default and initialize edited rules
      const allPaths = new Set<string>()
      const initialEditedRules = new Map<string, EditedRule>()

      const collectPaths = (rule: ParsedRule) => {
        allPaths.add(rule.path)
        // Initialize with parsed values
        initialEditedRules.set(rule.path, {
          condition: rule.condition,
          required: rule.required,
        })
        rule.children?.forEach(collectPaths)
      }
      rules.forEach(collectPaths)
      setSelectedRules(allPaths)
      setEditedRules(initialEditedRules)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse XML')
      setParsedRules([])
    } finally {
      setIsParsing(false)
    }
  }

  const handleToggleRule = (path: string) => {
    setSelectedRules(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const handleSaveRules = async () => {
    try {
      // Flatten rules and filter by selected
      const flattenRules = (
        rules: ParsedRule[],
        parentPath?: string
      ): Array<{
        name: string
        path: string
        dataType: string
        required: boolean
        description?: string
        condition: any
        parentPath?: string
      }> => {
        const result: any[] = []

        rules.forEach(rule => {
          if (selectedRules.has(rule.path)) {
            // Get edited values from editedRules map
            const editedRule = editedRules.get(rule.path)

            result.push({
              name: rule.name,
              path: rule.path,
              dataType: rule.dataType,
              required: editedRule?.required ?? rule.required,
              description: rule.description,
              condition: editedRule?.condition ?? rule.condition,
              parentPath,
            })

            if (rule.children && rule.children.length > 0) {
              result.push(...flattenRules(rule.children, rule.path))
            }
          }
        })

        return result
      }

      const rulesToCreate = flattenRules(parsedRules)

      // If parent is selected, update paths
      let finalRules = rulesToCreate
      if (selectedParentId) {
        const parentRule = rules?.data.find(r => r.id === selectedParentId)
        if (parentRule) {
          finalRules = rulesToCreate.map(rule => ({
            ...rule,
            path: `${parentRule.path}.${rule.path}`,
            parentPath: rule.parentPath
              ? `${parentRule.path}.${rule.parentPath}`
              : parentRule.path, // Top level rules in this batch get the selected parent's path as parentPath
          }))
        }
      }

      await bulkCreateRules({
        projectId,
        rules: finalRules,
        parentId: selectedParentId || undefined,
      })

      // Reset and close
      setOpen(false)
      setXmlInput('')
      setParsedRules([])
      setSelectedRules(new Set())
      setEditedRules(new Map())
      setSelectedParentId(null)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rules')
    }
  }

  const renderRule = (
    rule: ParsedRule,
    level: number = 0
  ): React.ReactElement => {
    const indent = level * 32
    const isSelected = selectedRules.has(rule.path)
    const editedRule = editedRules.get(rule.path)
    const currentCondition = editedRule?.condition ?? rule.condition
    const isRequired = editedRule?.required ?? rule.required

    const handleConditionChange = (newCondition: any) => {
      setEditedRules(prev => {
        const next = new Map(prev)
        next.set(rule.path, {
          condition: newCondition,
          required: isRequired,
        })
        return next
      })
    }

    const handleRequiredChange = (checked: boolean) => {
      setEditedRules(prev => {
        const next = new Map(prev)
        next.set(rule.path, {
          condition: currentCondition,
          required: checked,
        })
        return next
      })
    }

    return (
      <>
        <TableRow key={rule.path}>
          <TableCell style={{ paddingLeft: `${indent + 16}px` }}>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggleRule(rule.path)}
              />
              {level > 0 && <span className="text-gray-400">└─</span>}
              <span className="font-medium">{rule.name}</span>
            </div>
          </TableCell>
          <TableCell className="font-mono text-sm">{rule.path}</TableCell>
          <TableCell>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {rule.dataType}
            </code>
          </TableCell>
          <TableCell>
            <Checkbox
              checked={isRequired}
              onCheckedChange={handleRequiredChange}
              disabled={!isSelected}
            />
          </TableCell>
          <TableCell className="text-sm text-gray-600 min-w-[300px]">
            {isSelected && rule.dataType === 'string' && (
              <div className="my-2">
                <StringConditionInput
                  condition={currentCondition}
                  onChange={handleConditionChange}
                />
              </div>
            )}
            {isSelected && rule.dataType === 'number' && (
              <div className="my-2">
                <NumberConditionInput
                  condition={currentCondition}
                  onChange={handleConditionChange}
                />
              </div>
            )}
            {(!isSelected ||
              (rule.dataType !== 'string' && rule.dataType !== 'number')) && (
              <span className="text-xs text-gray-400">
                {Object.keys(currentCondition).length > 0
                  ? JSON.stringify(currentCondition)
                  : '-'}
              </span>
            )}
          </TableCell>
        </TableRow>
        {rule.children?.map(child => renderRule(child, level + 1))}
      </>
    )
  }

  const parentCandidates = rules?.data.filter(rule => {
    // Must be object or array
    if (rule.dataType !== 'object' && rule.dataType !== 'array') return false

    // Must not be a global rule
    if (rule.globalRuleId) return false

    // If array, must not have children (arrays can only have 1 child)
    if (rule.dataType === 'array') {
      const hasChildren = rules.data.some(r => r.parentId === rule.id)
      if (hasChildren) return false
    }

    return true
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {canEdit && (
          <Button variant="outline">
            <FileCode2 className="mr-2 h-4 w-4" />
            Import from XML
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[90vw]! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Rules from XML</DialogTitle>
          <DialogDescription>
            Paste your XML sample below and we'll automatically generate
            validation rules.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Parent Rule Selection */}
          {parentCandidates && parentCandidates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="parentRule">Parent Rule (Optional)</Label>
              <Select
                value={selectedParentId?.toString() || 'none'}
                onValueChange={value =>
                  setSelectedParentId(value === 'none' ? null : Number(value))
                }
              >
                <SelectTrigger id="parentRule" className="w-full">
                  <SelectValue placeholder="Select a parent rule..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Create at root)</SelectItem>
                  {parentCandidates.map(rule => (
                    <SelectItem key={rule.id} value={rule.id.toString()}>
                      {rule.name} ({rule.path})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Select an existing Object or empty Array rule to import these
                rules under.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="xml-input">XML Sample</Label>
            <Textarea
              id="xml-input"
              value={xmlInput}
              onChange={e => setXmlInput(e.target.value)}
              placeholder="<order>&#10;  <id>12345</id>&#10;  <customer>&#10;    <name>John Doe</name>&#10;  </customer>&#10;</order>"
              className="font-mono text-sm h-40"
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          <Button
            onClick={handleParse}
            disabled={!xmlInput.trim() || isParsing}
          >
            {isParsing ? 'Parsing...' : 'Parse XML'}
          </Button>

          {parsedRules.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">
                Generated Rules ({selectedRules.size} selected)
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Condition</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedRules.map(rule => renderRule(rule))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveRules}
            disabled={selectedRules.size === 0 || isPending}
          >
            {isPending ? 'Saving...' : `Save ${selectedRules.size} Rules`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
