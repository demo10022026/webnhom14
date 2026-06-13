import { Outlet } from 'react-router-dom'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main>
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}