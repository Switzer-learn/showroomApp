"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/app/utils/supabase/client"

interface PenjualanMobilProps {
    isOpen: boolean;
    onClose: () => void;
    carData: {
        id: string;
        merk: string;
        model: string;
        series: string;
        plat_nomor: string;
        harga_jual: number;
    };
}

interface CustomerData {
    nama: string;
    no_hp: string;
    alamat: string;
    jenis_kelamin: 'Laki-laki' | 'Perempuan';
}

interface PaymentData {
    metode_pembayaran: 'Tunai' | 'Kredit';
    uang_muka: number;
    nama_leasing: string;
    harga_kredit: number;
    dana_dari_leasing: number;
}

export default function PenjualanMobil({ isOpen, onClose, carData }: PenjualanMobilProps) {
    const [customerData, setCustomerData] = useState<CustomerData>({
        nama: '',
        no_hp: '',
        alamat: '',
        jenis_kelamin: 'Laki-laki'
    })

    const [paymentData, setPaymentData] = useState<PaymentData>({
        metode_pembayaran: 'Tunai',
        uang_muka: 0,
        nama_leasing: '',
        harga_kredit: 0,
        dana_dari_leasing: 0
    })

    const [hargaJual, setHargaJual] = useState(carData.harga_jual)
    const [totalHarga, setTotalHarga] = useState(carData.harga_jual)

    // Calculate total price when payment method changes
    useEffect(() => {
        if (paymentData.metode_pembayaran === 'Tunai') {
            setTotalHarga(hargaJual)
        } else {
            const total = paymentData.uang_muka + paymentData.harga_kredit + paymentData.dana_dari_leasing
            setTotalHarga(total)
        }
    }, [paymentData, hargaJual])

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setCustomerData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setPaymentData(prev => ({
            ...prev,
            [name]: name === 'metode_pembayaran' ? value : Number(value)
        }))
    }

    const handleHargaJualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value)
        setHargaJual(value)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value)
    }

    if (!isOpen) return null

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-3xl">
                <h3 className="font-bold text-lg mb-4">Penjualan Mobil</h3>
                
                {/* Car Information */}
                <div className="bg-base-200 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Informasi Mobil</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <p><span className="font-medium">Merk/Model:</span> {carData.merk} {carData.model} {carData.series}</p>
                        <p><span className="font-medium">Plat Nomor:</span> {carData.plat_nomor}</p>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Harga Jual</span>
                            </label>
                            <input
                                type="number"
                                value={hargaJual}
                                onChange={handleHargaJualChange}
                                className="input input-bordered"
                                placeholder={`${formatCurrency(carData.harga_jual)}`}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="bg-base-200 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Informasi Pembeli</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Nama Lengkap</span>
                            </label>
                            <input
                                type="text"
                                name="nama"
                                value={customerData.nama}
                                onChange={handleCustomerChange}
                                className="input input-bordered"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Nomor HP</span>
                            </label>
                            <input
                                type="tel"
                                name="no_hp"
                                value={customerData.no_hp}
                                onChange={handleCustomerChange}
                                className="input input-bordered"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Alamat</span>
                            </label>
                            <input
                                type="text"
                                name="alamat"
                                value={customerData.alamat}
                                onChange={handleCustomerChange}
                                className="input input-bordered"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Jenis Kelamin</span>
                            </label>
                            <select
                                name="jenis_kelamin"
                                value={customerData.jenis_kelamin}
                                onChange={handleCustomerChange}
                                className="select select-bordered"
                                required
                            >
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="bg-base-200 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">Informasi Pembayaran</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Metode Pembayaran</span>
                            </label>
                            <select
                                name="metode_pembayaran"
                                value={paymentData.metode_pembayaran}
                                onChange={handlePaymentChange}
                                className="select select-bordered"
                                required
                            >
                                <option value="Tunai">Tunai</option>
                                <option value="Kredit">Kredit</option>
                            </select>
                        </div>

                        {paymentData.metode_pembayaran === 'Kredit' && (
                            <>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Uang Muka</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="uang_muka"
                                        value={paymentData.uang_muka}
                                        onChange={handlePaymentChange}
                                        className="input input-bordered"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Nama Leasing</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_leasing"
                                        value={paymentData.nama_leasing}
                                        onChange={handlePaymentChange}
                                        className="input input-bordered"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Harga Kredit</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="harga_kredit"
                                        value={paymentData.harga_kredit}
                                        onChange={handlePaymentChange}
                                        className="input input-bordered"
                                        required
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Dana dari Leasing</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="dana_dari_leasing"
                                        value={paymentData.dana_dari_leasing}
                                        onChange={handlePaymentChange}
                                        className="input input-bordered"
                                        required
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Total Price Display */}
                    <div className="mt-4 p-3 bg-primary text-primary-content rounded-lg">
                        <p className="font-bold">Total Harga: {formatCurrency(totalHarga)}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={onClose}>Batal</button>
                    <button className="btn btn-primary">Simpan Penjualan</button>
                </div>
            </div>
        </div>
    )
}
