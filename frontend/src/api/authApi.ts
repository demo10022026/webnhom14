import axiosInstance from './axiosInstance'
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserInfo } from '@/types/auth.types'
import { unwrapApiResponse } from '@/api/apiResponse'

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return unwrapApiResponse(res.data)
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data)
    return unwrapApiResponse(res.data)
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post('/auth/logout', { refreshToken })
  },

  // ---- OTP / Verification ----
  sendVerifyEmail: async (email: string) => {
    await axiosInstance.post('/auth/send-verify-email', { email })
  },

  verifyEmail: async (email: string, otp: string) => {
    await axiosInstance.post('/auth/verify-email', { email, otp })
  },

  forgotPassword: async (email: string) => {
    await axiosInstance.post('/auth/forgot-password', { email })
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    await axiosInstance.post('/auth/reset-password', { email, otp, newPassword })
  },

  changePassword: async (currentPassword: string, newPassword: string, otp: string) => {
    await axiosInstance.post('/auth/change-password', { currentPassword, newPassword, otp })
  },

  updateAvatar: async (avatar: File): Promise<UserInfo> => {
    const formData = new FormData()
    formData.append('avatar', avatar)

    const res = await axiosInstance.patch<ApiResponse<UserInfo>>(
      '/auth/me/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )

    return unwrapApiResponse(res.data)
  },
}
