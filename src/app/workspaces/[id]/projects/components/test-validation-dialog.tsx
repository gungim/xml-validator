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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useValidate } from '@/src/app/lib/hooks/validate'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'

interface TestValidationDialogProps {
  projectId: string
  endpointSlug: string
  endpointSecret: string
}

export function TestValidationDialog({
  projectId,
  endpointSlug,
  endpointSecret,
}: TestValidationDialogProps) {
  const [open, setOpen] = useState(false)
  const [xmlInput, setXmlInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const {
    mutateAsync: validateMutation,
    isPending: isValidating,
    data: validationResult,
  } = useValidate(endpointSlug, endpointSecret)

  const handleValidate = async () => {
    if (!xmlInput.trim()) {
      setError('Please enter XML content to validate')
      return
    }

    setError(null)
    validateMutation(xmlInput)
  }

  const handleReset = () => {
    setXmlInput('')
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Test Validation</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test XML Validation</DialogTitle>
          <DialogDescription>
            Enter XML content below to test validation against this project's
            rules.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="xml-input">XML Content</Label>
            <Textarea
              id="xml-input"
              placeholder="Paste your XML content here..."
              value={xmlInput}
              onChange={e => setXmlInput(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              disabled={isValidating}
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            </div>
          )}

          {validationResult && (
            <div
              className={`rounded-md border p-4 ${
                validationResult?.data?.isValid
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-2 mb-3">
                {validationResult?.data?.isValid ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-green-900">
                        Validation Successful
                      </div>
                      <div className="text-sm text-green-700">
                        The XML content is valid and matches all project rules.
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-red-900">
                        Validation Failed
                      </div>
                      <div className="text-sm text-red-700 mb-3">
                        Found {validationResult?.data?.errors?.length || 0}{' '}
                        error(s):
                      </div>

                      {validationResult?.data?.errors &&
                        validationResult?.data?.errors.length > 0 && (
                          <div className="space-y-2">
                            {validationResult?.data?.errors.map(
                              (error, index) => (
                                <div
                                  key={index}
                                  className="bg-white rounded border border-red-200 p-3"
                                >
                                  <div className="text-sm">
                                    <div className="font-medium text-red-900 mb-1">
                                      Path:{' '}
                                      <code className="bg-red-100 px-1.5 py-0.5 rounded text-xs">
                                        {error.path}
                                      </code>
                                    </div>
                                    <div className="text-red-800 mb-1">
                                      {error.message}
                                    </div>
                                    {error.value && (
                                      <div className="text-xs text-red-600">
                                        Value:{' '}
                                        <code className="bg-red-100 px-1.5 py-0.5 rounded">
                                          {error.value}
                                        </code>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isValidating}
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleValidate}
              disabled={isValidating || !xmlInput.trim()}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
