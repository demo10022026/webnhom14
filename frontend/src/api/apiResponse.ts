import type { ApiResponse } from '@/types/auth.types'

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === undefined || response.data === null) {
    throw new Error(response.message || response.errorCode || 'API response không hợp lệ')
  }

  return response.data
}
