import { Mail, MapPin, Phone, ShoppingBag } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="mt-10 border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Logo / giới thiệu */}
                    <div>
                        <div className="flex items-center gap-2 text-xl font-bold text-orange-500">
                            <ShoppingBag size={26} />
                            <span>ShopVN</span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-gray-600">
                            Nền tảng mua sắm trực tuyến, cung cấp sản phẩm chất lượng với
                            trải nghiệm mua hàng nhanh chóng và tiện lợi.
                        </p>
                    </div>

                    {/* Liên hệ */}
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Thông tin liên hệ
                        </h3>

                        <div className="mt-4 space-y-3 text-sm text-gray-600">
                            <div className="flex items-start gap-3">
                                <Mail size={18} className="mt-0.5 text-orange-500" />
                                <a
                                    href="mailto:demo10022026@gmail.com"
                                    className="hover:text-orange-500"
                                >
                                    demo10022026@gmail.com
                                </a>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone size={18} className="mt-0.5 text-orange-500" />
                                <a href="tel:0976441504" className="hover:text-orange-500">
                                    0976441504
                                </a>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="mt-0.5 text-orange-500" />
                                <span>Mai Dịch, Nam Từ Liêm, Hà Nội</span>
                            </div>
                        </div>
                    </div>

                    {/* Chính sách */}
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Hỗ trợ khách hàng
                        </h3>

                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                            <li>
                                <a href="#" className="hover:text-orange-500">
                                    Chính sách bảo mật
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-orange-500">
                                    Chính sách đổi trả
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-orange-500">
                                    Điều khoản sử dụng
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-orange-500">
                                    Hướng dẫn mua hàng
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
                    © 2026 ShopVN. All rights reserved.
                </div>
            </div>
        </footer>
    )
}