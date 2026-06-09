import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
    Home,
    Loader2,
    MapPin,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react'
import {
    addressApi,
    type UserAddress,
} from '@/api/addressApi'
import AddressModal from '@/components/address/AddressModal'

function addressTypeLabel(type?: string) {
    switch (type) {
        case 'home':
            return 'Nhà riêng'
        case 'office':
            return 'Công ty'
        case 'other':
            return 'Khác'
        default:
            return 'Khác'
    }
}

function AddressCard({
                         address,
                         onEdit,
                     }: {
    address: UserAddress
    onEdit: (address: UserAddress) => void
}) {
    const queryClient = useQueryClient()

    const setDefaultMutation = useMutation({
        mutationFn: addressApi.setDefaultAddress,
        onSuccess: () => {
            toast.success('Đã đặt làm mặc định')
            queryClient.invalidateQueries({
                queryKey: ['myAddresses'],
            })
            queryClient.invalidateQueries({
                queryKey: ['addresses'],
            })
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message || 'Không thể đặt mặc định'
            )
        },
    })

    const deleteMutation = useMutation({
        mutationFn: addressApi.deleteAddress,
        onSuccess: () => {
            toast.success('Đã xóa địa chỉ')
            queryClient.invalidateQueries({
                queryKey: ['myAddresses'],
            })
            queryClient.invalidateQueries({
                queryKey: ['addresses'],
            })
        },
        onError: (err: any) => {
            toast.error(
                err?.response?.data?.message || 'Không thể xóa địa chỉ'
            )
        },
    })

    const handleDelete = () => {
        const ok = window.confirm('Bạn chắc chắn muốn xóa địa chỉ này?')

        if (!ok) return

        deleteMutation.mutate(address.addressId)
    }

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                            {address.receiverName}
                        </h3>

                        <span className="h-4 w-px bg-gray-200" />

                        <span className="text-sm text-gray-500">
                            {address.receiverPhone}
                        </span>

                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                            {addressTypeLabel(address.addressType)}
                        </span>

                        {address.isDefault && (
                            <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
                                Mặc định
                            </span>
                        )}
                    </div>

                    <div className="mt-3 flex gap-2 text-sm text-gray-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                        <div>
                            <p>{address.addressLine}</p>
                            <p>
                                {address.wardName}, {address.districtName},{' '}
                                {address.provinceName}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                    {!address.isDefault && (
                        <button
                            type="button"
                            disabled={setDefaultMutation.isPending}
                            onClick={() =>
                                setDefaultMutation.mutate(address.addressId)
                            }
                            className="rounded-xl border border-orange-200 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-60"
                        >
                            Đặt mặc định
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => onEdit(address)}
                        className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <Pencil size={15} />
                        Sửa
                    </button>

                    <button
                        type="button"
                        disabled={deleteMutation.isPending}
                        onClick={handleDelete}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                        <Trash2 size={15} />
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AddressesPage() {
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
        null
    )

    const {
        data: addresses = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['myAddresses'],
        queryFn: addressApi.getMyAddresses,
        staleTime: 0,
    })

    const openCreate = () => {
        setEditingAddress(null)
        setModalOpen(true)
    }

    const openEdit = (address: UserAddress) => {
        setEditingAddress(address)
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditingAddress(null)
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Địa chỉ của tôi
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Quản lý địa chỉ giao hàng dùng khi đặt hàng.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                >
                    <Plus size={17} />
                    Thêm địa chỉ mới
                </button>
            </div>

            {isLoading ? (
                <div className="flex min-h-[300px] items-center justify-center text-gray-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang tải địa chỉ...
                </div>
            ) : isError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-700">
                    Không thể tải danh sách địa chỉ.
                </div>
            ) : addresses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
                    <Home className="mx-auto h-12 w-12 text-gray-300" />

                    <h2 className="mt-4 font-semibold text-gray-800">
                        Bạn chưa có địa chỉ nào
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Thêm địa chỉ để dùng khi đặt hàng.
                    </p>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                        <Plus size={17} />
                        Thêm địa chỉ mới
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {addresses.map((address) => (
                        <AddressCard
                            key={address.addressId}
                            address={address}
                            onEdit={openEdit}
                        />
                    ))}
                </div>
            )}

            <AddressModal
                open={modalOpen}
                editingAddress={editingAddress}
                onClose={closeModal}
            />
        </div>
    )
}
