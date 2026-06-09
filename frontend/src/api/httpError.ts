import axios from 'axios'
import type { ApiResponse } from '@/types/auth.types'

export function getApiErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        return error.response?.data?.message || fallback
    }

    return fallback
}

export function getApiErrorStatus(error: unknown) {
    if (axios.isAxiosError(error)) {
        return error.response?.status
    }

    return undefined
}

export function getApiErrorCode(error: unknown) {
    if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
        return error.response?.data?.errorCode
    }

    return undefined
}
