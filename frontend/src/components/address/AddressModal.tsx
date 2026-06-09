import { type FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import {
    addressApi,
    type AddressType,
    type UserAddress,
    type UserAddressPayload,
} from '@/api/addressApi'
import { getApiErrorMessage } from '@/api/httpError'
import { provinceOpenApi } from '@/api/provinceOpenApi'

interface AddressFormState {
    receiverName: string
    receiverPhone: string

    provinceCode: string
    districtCode: string
    wardCode: string

    provinceName: string
    districtName: string
    wardName: string

    addressLine: string
    addressType: AddressType
    isDefault: boolean
}

const EMPTY_FORM: AddressFormState = {
    receiverName: '',
    receiverPhone: '',

    provinceCode: '',
    districtCode: '',
    wardCode: '',

    provinceName: '',
    districtName: '',
    wardName: '',

    addressLine: '',
    addressType: 'home',
    isDefault: false,
}

function toPayload(form: AddressFormState): UserAddressPayload {
    return {
        receiverName: form.receiverName.trim(),
        receiverPhone: form.receiverPhone.trim(),

        provinceCode: form.provinceCode.trim() || undefined,
        districtCode: form.districtCode.trim() || undefined,
        wardCode: form.wardCode.trim() || undefined,

        provinceName: form.provinceName.trim(),
        districtName: form.districtName.trim(),
        wardName: form.wardName.trim(),

        addressLine: form.addressLine.trim(),
        addressType: form.addressType,
        isDefault: form.isDefault,
    }
}

function toForm(address: UserAddress): AddressFormState {
    return {
        receiverName: address.receiverName ?? '',
        receiverPhone: address.receiverPhone ?? '',

        provinceCode: address.provinceCode ?? '',
        districtCode: address.districtCode ?? '',
        wardCode: address.wardCode ?? '',

        provinceName: address.provinceName ?? '',
        districtName: address.districtName ?? '',
        wardName: address.wardName ?? '',

        addressLine: address.addressLine ?? '',
        addressType: address.addressType ?? 'home',
        isDefault: Boolean(address.isDefault),
    }
}

function validateForm(form: AddressFormState) {
    if (!form.receiverName.trim()) {
        toast.error('Nhập tên người nhận')
        return false
    }

    if (!form.receiverPhone.trim()) {
        toast.error('Nhập số điện thoại')
        return false
    }

    if (!form.provinceCode || !form.provinceName.trim()) {
        toast.error('Chọn Tỉnh/Thành phố')
        return false
    }

    if (!form.districtCode || !form.districtName.trim()) {
        toast.error('Chọn Quận/Huyện')
        return false
    }

    if (!form.wardCode || !form.wardName.trim()) {
        toast.error('Chọn Phường/Xã')
        return false
    }

    if (!form.addressLine.trim()) {
        toast.error('Nhập địa chỉ cụ thể')
        return false
    }

    return true
}

interface AddressModalProps {
    open: boolean
    editingAddress: UserAddress | null
    onClose: () => void
    onSaved?: (address: UserAddress) => void
}

export default function AddressModal({
    open,
    editingAddress,
    onClose,
    onSaved,
}: AddressModalProps) {
    const queryClient = useQueryClient()
    const [form, setForm] = useState<AddressFormState>(EMPTY_FORM)

    const {
        data: provinces = [],
        isLoading: isLoadingProvinces,
        isError: isProvincesError,
    } = useQuery({
        queryKey: ['vnProvinces'],
        queryFn: provinceOpenApi.getProvinces,
        enabled: open,
        staleTime: 24 * 60 * 60 * 1000,
        retry: 1,
    })

    const {
        data: districts = [],
        isLoading: isLoadingDistricts,
    } = useQuery({
        queryKey: ['vnDistricts', form.provinceCode],
        queryFn: () => provinceOpenApi.getDistricts(form.provinceCode),
        enabled: open && !!form.provinceCode,
        staleTime: 24 * 60 * 60 * 1000,
        retry: 1,
    })

    const {
        data: wards = [],
        isLoading: isLoadingWards,
    } = useQuery({
        queryKey: ['vnWards', form.districtCode],
        queryFn: () => provinceOpenApi.getWards(form.districtCode),
        enabled: open && !!form.districtCode,
        staleTime: 24 * 60 * 60 * 1000,
        retry: 1,
    })

    useEffect(() => {
        if (!open) return

        setForm(editingAddress ? toForm(editingAddress) : EMPTY_FORM)
    }, [open, editingAddress])

    const invalidateAddressQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['addresses'] })
        queryClient.invalidateQueries({ queryKey: ['myAddresses'] })
    }

    const createMutation = useMutation({
        mutationFn: addressApi.createAddress,
        onSuccess: (address) => {
            toast.success('Thêm địa chỉ thành công')
            invalidateAddressQueries()
            onSaved?.(address)
            onClose()
        },
        onError: (err: unknown) => {
            toast.error(getApiErrorMessage(err, 'Không thể thêm địa chỉ'))
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({
            addressId,
            payload,
        }: {
            addressId: number
            payload: UserAddressPayload
        }) => addressApi.updateAddress(addressId, payload),
        onSuccess: (address) => {
            toast.success('Cập nhật địa chỉ thành công')
            invalidateAddressQueries()
            onSaved?.(address)
            onClose()
        },
        onError: (err: unknown) => {
            toast.error(getApiErrorMessage(err, 'Không thể cập nhật địa chỉ'))
        },
    })

    if (!open) return null

    const isPending = createMutation.isPending || updateMutation.isPending

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()

        if (!validateForm(form)) return

        const payload = toPayload(form)

        if (editingAddress) {
            updateMutation.mutate({
                addressId: editingAddress.addressId,
                payload,
            })
        } else {
            createMutation.mutate(payload)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div className="border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {editingAddress
                            ? 'Cập nhật địa chỉ'
                            : 'Thêm địa chỉ mới'}
                    </h2>

                    {isProvincesError && (
                        <p className="mt-1 text-sm text-red-500">
                            Không thể tải danh sách tỉnh/thành. Kiểm tra kết nối mạng.
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Họ tên người nhận
                            </label>

                            <input
                                value={form.receiverName}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        receiverName: e.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                                placeholder="Họ tên nhận hàng"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Số điện thoại
                            </label>

                            <input
                                value={form.receiverPhone}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        receiverPhone: e.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                                placeholder="Số điện thoại người nhận"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Tỉnh/Thành phố
                            </label>

                            <select
                                value={form.provinceCode}
                                onChange={(e) => {
                                    const code = e.target.value
                                    const selected = provinces.find(
                                        (item) => String(item.code) === code
                                    )

                                    setForm((prev) => ({
                                        ...prev,
                                        provinceCode: code,
                                        provinceName: selected?.name ?? '',
                                        districtCode: '',
                                        districtName: '',
                                        wardCode: '',
                                        wardName: '',
                                    }))
                                }}
                                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                            >
                                <option value="">
                                    {isLoadingProvinces
                                        ? 'Đang tải tỉnh/thành...'
                                        : 'Chọn tỉnh/thành'}
                                </option>

                                {provinces.map((province) => (
                                    <option
                                        key={province.code}
                                        value={province.code}
                                    >
                                        {province.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Quận/Huyện
                            </label>

                            <select
                                value={form.districtCode}
                                disabled={!form.provinceCode}
                                onChange={(e) => {
                                    const code = e.target.value
                                    const selected = districts.find(
                                        (item) => String(item.code) === code
                                    )

                                    setForm((prev) => ({
                                        ...prev,
                                        districtCode: code,
                                        districtName: selected?.name ?? '',
                                        wardCode: '',
                                        wardName: '',
                                    }))
                                }}
                                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <option value="">
                                    {isLoadingDistricts
                                        ? 'Đang tải quận/huyện...'
                                        : form.provinceCode
                                            ? 'Chọn quận/huyện'
                                            : 'Chọn tỉnh/thành trước'}
                                </option>

                                {districts.map((district) => (
                                    <option
                                        key={district.code}
                                        value={district.code}
                                    >
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Phường/Xã
                            </label>

                            <select
                                value={form.wardCode}
                                disabled={!form.districtCode}
                                onChange={(e) => {
                                    const code = e.target.value
                                    const selected = wards.find(
                                        (item) => String(item.code) === code
                                    )

                                    setForm((prev) => ({
                                        ...prev,
                                        wardCode: code,
                                        wardName: selected?.name ?? '',
                                    }))
                                }}
                                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <option value="">
                                    {isLoadingWards
                                        ? 'Đang tải phường/xã...'
                                        : form.districtCode
                                            ? 'Chọn phường/xã'
                                            : 'Chọn quận/huyện trước'}
                                </option>

                                {wards.map((ward) => (
                                    <option
                                        key={ward.code}
                                        value={ward.code}
                                    >
                                        {ward.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Địa chỉ cụ thể
                        </label>

                        <textarea
                            value={form.addressLine}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    addressLine: e.target.value,
                                }))
                            }
                            rows={3}
                            className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                            placeholder="Số nhà, tên đường, tòa nhà..."
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Loại địa chỉ
                            </label>

                            <select
                                value={form.addressType}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        addressType: e.target.value as AddressType,
                                    }))
                                }
                                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-orange-500"
                            >
                                <option value="home">Nhà riêng</option>
                                <option value="office">Công ty</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>

                        <label className="flex items-center gap-2 pt-7 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={form.isDefault}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        isDefault: e.target.checked,
                                    }))
                                }
                            />
                            Đặt làm địa chỉ mặc định
                        </label>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                        <div className="font-medium text-gray-800">
                            Xem trước địa chỉ
                        </div>

                        <div className="mt-1">
                            {form.addressLine || 'Địa chỉ cụ thể'}
                            {form.wardName ? `, ${form.wardName}` : ''}
                            {form.districtName ? `, ${form.districtName}` : ''}
                            {form.provinceName ? `, ${form.provinceName}` : ''}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                        >
                            {isPending && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
