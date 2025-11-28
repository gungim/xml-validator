'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loading } from '@/src/app/components/loading'
import { useValidationLogs } from '@/src/app/lib/hooks/validate'
import { format } from 'date-fns'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface ValidationLog {
  id: string
  ip: string | null
  status: 'SUCCESS' | 'FAILURE'
  error: string | null
  createdAt: string
}

interface ValidationLogsProps {
  projectId: string
}

export function ValidationLogs({ projectId }: ValidationLogsProps) {
  const { data: logs, isLoading } = useValidationLogs(projectId)

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Validation History</h3>
        <span className="text-sm text-gray-500">Auto-refreshing every 5s</span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500"
                >
                  No validation logs found
                </TableCell>
              </TableRow>
            ) : (
              logs?.data?.map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    {log.status === 'SUCCESS' ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        <span className="font-medium">Success</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="font-medium">Failure</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.ip || 'Unknown'}
                  </TableCell>
                  <TableCell
                    className="max-w-md truncate"
                    title={log.error || ''}
                  >
                    {log.error || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
