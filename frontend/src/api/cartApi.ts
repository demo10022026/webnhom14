import axiosInstance from './axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import { unwrapApiResponse } from '@/api/apiResponse'
import type {
    AddToCartRequest,
    CartResponse,
    UpdateCartItemRequest,
} from '@/types/cart.types'

export const cartApi = {
    getCart: async (): Promise<CartResponse> => {
        const res = await axiosInstance.get<ApiResponse<CartResponse>>('/cart')
        return unwrapApiResponse(res.data)
    },

    addItem: async (body: AddToCartRequest): Promise<CartResponse> => {
        const res = await axiosInstance.post<ApiResponse<CartResponse>>(
            '/cart/items',
            body
        )
        return unwrapApiResponse(res.data)
    },

    updateItem: async (
        cartItemId: number,
        body: UpdateCartItemRequest
    ): Promise<CartResponse> => {
        const res = await axiosInstance.put<ApiResponse<CartResponse>>(
            `/cart/items/${cartItemId}`,
            body
        )
        return unwrapApiResponse(res.data)
    },

    removeItem: async (cartItemId: number): Promise<CartResponse> => {
        const res = await axiosInstance.delete<ApiResponse<CartResponse>>(
            `/cart/items/${cartItemId}`
        )
        return unwrapApiResponse(res.data)
    },

    clearCart: async (): Promise<CartResponse> => {
        const res = await axiosInstance.delete<ApiResponse<CartResponse>>(
            '/cart/clear'
        )
        return unwrapApiResponse(res.data)
    },
}
