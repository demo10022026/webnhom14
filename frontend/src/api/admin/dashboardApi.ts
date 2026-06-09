import axiosInstance from '@/api/axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import { unwrapApiResponse } from '@/api/apiResponse'

export interface DashboardResponse {
    totalUsers: number
    totalSellers: number
    totalProducts: number
    totalOrders: number
    totalRevenue: number

    approvedSellerCount: number
    pendingSellerCount: number

    newUsersToday: number
    newUsersThisWeek: number
    newUsersThisMonth: number

    recentPendingSellers: PendingSellerItem[]

    topByQuantity: TopProduct[]
    topByRevenue: TopProduct[]
}

export const adminDashboardApi = {
    getDashboard: async (): Promise<DashboardResponse> => {
        const res = await axiosInstance.get<ApiResponse<DashboardResponse>>(
            '/admin/dashboard'
        )

        console.log('dashboard response', res.data)

        return unwrapApiResponse(res.data)
    },
}

export interface PendingSellerItem {
    sellerId: number
    fullName: string
    email: string
    identityNumber: string
    verificationStatus: string
    documentCount: number
    createdAt: string
}

export interface TopProduct {
    rank: number
    productId: number
    productName: string
    thumbnailUrl: string
    shopName: string
    categoryName: string
    totalQuantity: number
    totalRevenue: number
}