import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Layouts & Guards
import MainLayout from '@/components/layout/MainLayout'
import ProtectedRoute from '@/components/ui/ProtectedRoute'

import SellerProtectedRoute from '@/components/ui/SellerProtectedRoute'

// Admin
import AdminLayout from '@/components/admin/AdminLayout'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))

const HomePage = lazy(() => import('@/pages/HomePage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const FlashSalePage = lazy(() =>
    import('@/pages/FlashSalePage').then((module) => ({
        default: module.FlashSalePage,
    }))
)
const ProductReviewsPage = lazy(() => import('@/pages/ProductReviewsPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const MessagesPage = lazy(() => import('@/pages/MessagesPage'))

const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
const AddressesPage = lazy(() => import('@/pages/AddressesPage'))
const ShopPage = lazy(() => import('@/pages/ShopPage'))
const VouchersPage = lazy(() => import('@/pages/VouchersPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))

const BecomeSellerPage = lazy(() => import('@/pages/seller/BecomeSellerPage'))
const SellerStatusPage = lazy(() => import('@/pages/seller/SellerStatusPage'))
const ShopSetupPage = lazy(() => import('@/pages/seller/ShopSetupPage'))
const SellerDashboardPage = lazy(() => import('@/pages/seller/SellerDashboardPage'))
const CreateProductPage = lazy(() => import('@/pages/seller/CreateProductPage'))
const SellerProductsPage = lazy(() => import('@/pages/seller/SellerProductsPage'))
const EditProductPage = lazy(() => import('@/pages/seller/EditProductPage'))
const SellerOrdersPage = lazy(() => import('@/pages/seller/SellerOrdersPage'))
const SellerAnalyticsPage = lazy(() => import('@/pages/seller/SellerAnalyticsPage'))
const EditShopPage = lazy(() => import('@/pages/seller/EditShopPage'))
const SellerVouchersPage = lazy(() => import('@/pages/seller/SellerVouchersPage'))

const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'))
const AdminProductDetailPage = lazy(() => import('@/pages/admin/AdminProductDetailPage'))
const AdminSellersPage = lazy(() => import('@/pages/admin/AdminSellersPage'))
const AdminSellerDetailPage = lazy(() => import('@/pages/admin/AdminSellerDetailPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminUserDetailPage = lazy(() => import('@/pages/admin/AdminUserDetailPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminOrderDetailPage = lazy(() => import('@/pages/admin/AdminOrderDetailPage'))
const AdminVouchersPage = lazy(() => import('@/pages/admin/AdminVouchersPage'))
const AdminVoucherDetailPage = lazy(() => import('@/pages/admin/AdminVoucherDetailPage'))

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000,
        },
    },
})

function RouteFallback() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
            Đang tải...
        </div>
    )
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Suspense fallback={<RouteFallback />}>
                    <Routes>
                        {/* Auth */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                        {/* Public */}
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/search" element={<SearchPage />} />
                            <Route path="/products/:id" element={<ProductDetailPage />} />
                            <Route path="/flash-sale" element={<FlashSalePage />} />
                            <Route path="/products/:id/reviews" element={<ProductReviewsPage />} />
                        </Route>

                        {/* User authenticated */}
                        <Route
                            element={
                                <ProtectedRoute
                                    allowedRoles={['user', 'seller', 'admin', 'manager']}
                                />
                            }
                        >
                            <Route element={<MainLayout />}>
                                <Route path="/profile" element={<ProfilePage />} />

                                <Route path="/cart" element={<CartPage />} />
                                <Route path="/checkout" element={<CheckoutPage />} />
                                <Route path="/orders" element={<OrdersPage />} />
                                <Route path="/vouchers" element={<VouchersPage />} />
                                <Route path="/addresses" element={<AddressesPage />} />
                                <Route path="/notifications" element={<NotificationsPage />} />
                                <Route path="/messages" element={<MessagesPage />} />
                                <Route path="/user/addresses" element={<AddressesPage />} />
                                <Route path="/shops/:shopSlugOrId" element={<ShopPage />} />
                                <Route path="/shop/:shopSlugOrId" element={<ShopPage />} />

                                <Route path="/become-seller" element={<BecomeSellerPage />} />
                                <Route path="/seller/apply" element={<BecomeSellerPage />} />
                                <Route path="/seller/status" element={<SellerStatusPage />} />
                            </Route>
                        </Route>

                        {/* Seller only: phải có seller_profile approved */}
                        <Route element={<SellerProtectedRoute />}>
                            <Route element={<MainLayout />}>
                                <Route path="/seller/shop/setup" element={<ShopSetupPage />} />
                                <Route path="/seller/shop/profile" element={<EditShopPage />} />
                                <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
                                <Route path="/seller/products" element={<SellerProductsPage />} />
                                <Route path="/seller/products/new" element={<CreateProductPage />} />
                                <Route path="/seller/products/:id/edit" element={<EditProductPage />} />
                                <Route path="/seller/orders" element={<SellerOrdersPage />} />
                                <Route path="/seller/analytics" element={<SellerAnalyticsPage />} />
                                <Route path="/seller/vouchers" element={<SellerVouchersPage />} />
                            </Route>
                        </Route>

                        {/* Admin / Manager */}
                        <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
                            <Route path="/admin" element={<AdminLayout />}>

                                <Route index element={<Navigate to="/admin/sellers" replace />} />

                                <Route path="dashboard" element={<AdminDashboardPage />} />

                                <Route path="vouchers" element={<AdminVouchersPage />} />
                                <Route path="vouchers/:voucherId" element={<AdminVoucherDetailPage />} />

                                <Route path="users" element={<AdminUsersPage />} />
                                <Route path="users/:userId" element={<AdminUserDetailPage />} />

                                <Route path="sellers" element={<AdminSellersPage />} />
                                <Route path="sellers/:sellerId" element={<AdminSellerDetailPage />} />

                                <Route path="products" element={<AdminProductsPage />} />
                                <Route path="products/:productId" element={<AdminProductDetailPage />} />

                                <Route path="orders" element={<AdminOrdersPage />} />
                                <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
                            </Route>
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        fontSize: '14px',
                    },
                }}
            />
        </QueryClientProvider>
    )
}
