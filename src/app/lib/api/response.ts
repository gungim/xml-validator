import { NextResponse } from 'next/server'

// Success response type
export interface ApiSuccessResponse<T> {
  data: T
  count?: number
}

// Error response type
export interface ApiErrorResponse {
  error: string
  details?: any
}

// Union type for all possible responses
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// Type guard to check if response is successful
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return 'data' in response
}

// Type guard to check if response is an error
export function isErrorResponse<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return 'error' in response
}

// Helper function to create success response
export function createSuccessResponse<T>(
  data: T,
  count?: number
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = { data }
  if (count !== undefined) {
    response.count = count
  }
  return NextResponse.json(response)
}

// Helper function to create error response
export function createErrorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = { error }
  if (details) {
    response.details = details
  }
  return NextResponse.json(response, { status })
}
