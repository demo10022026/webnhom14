import axiosInstance from './axiosInstance'
import type { ApiResponse } from '@/types/auth.types'
import { unwrapApiResponse } from '@/api/apiResponse'
import type {
  HomeData,
  ProductSummary,
  FlashSaleProduct,
  ProductDetail,
  PageResponse,
  CategoryDto,
} from '@/types/product.types'

export const homeApi = {
  getHomeData: async (): Promise<HomeData> => {
    const res = await axiosInstance.get<ApiResponse<HomeData>>('/home')
    return unwrapApiResponse(res.data)
  },

  getFlashSale: async (limit = 12): Promise<FlashSaleProduct[]> => {
    const res = await axiosInstance.get<ApiResponse<FlashSaleProduct[]>>(
        `/home/flash-sale?limit=${limit}`
    )

    return unwrapApiResponse(res.data)
  },

  getNewProducts: async (limit = 12): Promise<ProductSummary[]> => {
    const res = await axiosInstance.get<ApiResponse<ProductSummary[]>>(
        `/home/new-products?limit=${limit}`
    )

    return unwrapApiResponse(res.data)
  },

  getBestSellers: async (limit = 12): Promise<ProductSummary[]> => {
    const res = await axiosInstance.get<ApiResponse<ProductSummary[]>>(
        `/home/best-sellers?limit=${limit}`
    )

    return unwrapApiResponse(res.data)
  },
}

export interface ProductSearchParams {
  keyword?: string
  parentCategoryId?: number
  categoryId?: number
  brandId?: number
  shopName?: string
  brandName?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
  size?: number
}

function cleanParams(params: ProductSearchParams) {
  return Object.fromEntries(
      Object.entries(params).filter(([, value]) => {
        return value !== undefined && value !== null && value !== ''
      })
  )
}

export const productApi = {
  getProducts: async (
      params: ProductSearchParams = {}
  ): Promise<PageResponse<ProductSummary>> => {
    const res = await axiosInstance.get<
        ApiResponse<PageResponse<ProductSummary>>
    >('/products', {
      params: cleanParams(params),
    })

    return unwrapApiResponse(res.data)
  },

  getDetail: async (id: number): Promise<ProductDetail> => {
    const res = await axiosInstance.get<ApiResponse<ProductDetail>>(
        `/products/${id}`
    )

    return unwrapApiResponse(res.data)
  },

  getCategories: async (): Promise<CategoryDto[]> => {
    const res = await axiosInstance.get<ApiResponse<CategoryDto[]>>(
        '/products/categories'
    )

    return unwrapApiResponse(res.data)
  },
}
