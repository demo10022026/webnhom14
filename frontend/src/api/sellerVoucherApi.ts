import axiosInstance from './axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import { unwrapApiResponse } from '@/api/apiResponse'

export interface PageResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
}

export type SellerVoucherDiscountType = 'fixed' | 'percent'
export type SellerVoucherStatus = 'active' | 'upcoming' | 'expired' | 'used_up'

export interface SellerVoucher {
    voucherId: number
    code: string
    voucherName: string

    discountType: SellerVoucherDiscountType
    discountValue: number
    maxDiscountAmount?: number | null
    minOrderAmount: number

    scope: 'shop'
    shopId: number
    shopName: string

    usageLimit: number
    usedCount: number
    remainingCount: number
    perUserLimit: number

    startTime: string
    endTime: string

    status: SellerVoucherStatus
}

export interface SellerVoucherPayload {
    code: string
    voucherName: string
    discountType: SellerVoucherDiscountType
    discountValue: number
    maxDiscountAmount?: number | null
    minOrderAmount: number
    usageLimit: number
    perUserLimit: number
    startTime: string
    endTime: string
}

export interface SellerVoucherListParams {
    keyword?: string
    status?: string
    page?: number
    size?: number
}

function cleanParams<T extends object>(params: T) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => {
            return value !== undefined && value !== null && value !== ''
        })
    )
}

export const sellerVoucherApi = {
    getMyShopVouchers: async (
        params: SellerVoucherListParams = {}
    ): Promise<PageResponse<SellerVoucher>> => {
        const res = await axiosInstance.get<
            ApiResponse<PageResponse<SellerVoucher>>
        >('/seller/vouchers', {
            params: cleanParams(params),
        })

        return unwrapApiResponse(res.data)
    },

    createVoucher: async (
        payload: SellerVoucherPayload
    ): Promise<SellerVoucher> => {
        const res = await axiosInstance.post<ApiResponse<SellerVoucher>>(
            '/seller/vouchers',
            payload
        )

        return unwrapApiResponse(res.data)
    },

    updateVoucher: async (
        voucherId: number,
        payload: SellerVoucherPayload
    ): Promise<SellerVoucher> => {
        const res = await axiosInstance.put<ApiResponse<SellerVoucher>>(
            `/seller/vouchers/${voucherId}`,
            payload
        )

        return unwrapApiResponse(res.data)
    },

    expireVoucher: async (
        voucherId: number
    ): Promise<SellerVoucher> => {
        const res = await axiosInstance.patch<ApiResponse<SellerVoucher>>(
            `/seller/vouchers/${voucherId}/expire`
        )

        return unwrapApiResponse(res.data)
    },
}
