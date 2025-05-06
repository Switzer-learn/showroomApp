"use client"

import { useEffect, useState } from "react"
import { CarInterface } from "@/app/type/car/carInterface"
import DashboardCarCard from "@/app/components/ui/DashboardCarCard"
import { createClient } from "@/app/utils/supabase/client"
import { FaFilter, FaSearch } from "react-icons/fa"
import { getUserLevel } from "@/app/lib/dbFunction"
import { isUserApproved } from "@/app/lib/auth"
import router from "next/router"

interface FilterState {
    merk: string;
    body_type: string;
    status: string;
    transmisi: string;
    kondisi: string;
    minHarga: string;
    maxHarga: string;
    searchQuery: string;
}

export default function Dashboard() {
    const [carData, setCarData] = useState<CarInterface[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<FilterState>({
        merk: '',
        body_type: '',
        status: '',
        transmisi: '',
        kondisi: '',
        minHarga: '',
        maxHarga: '',
        searchQuery: ''
    })
    const [userLevel, setUserLevel] = useState<'admin' | 'sales' | null>(null)
    const [uniqueValues, setUniqueValues] = useState({
        merks: [] as string[],
        bodyTypes: [] as string[],
        transmisi: ['Manual', 'Otomatis'],
        kondisi: ['Sangat Baik', 'Baik', 'Cukup', 'Rusak Ringan'],
        status: ['Tersedia', 'Terjual']
    })

    useEffect(() => {
            
        }, []);

    // Fetch unique values for filters
    useEffect(() => {
        async function fetchUniqueValues() {
            const supabase = createClient()
            
            // Fetch unique merks
            const { data: merks } = await supabase
                .from('mobil')
                .select('merk')
                .order('merk')
            
            // Fetch unique body types
            const { data: bodyTypes } = await supabase
                .from('mobil')
                .select('body_type')
                .order('body_type')

            setUniqueValues(prev => ({
                ...prev,
                merks: [...new Set(merks?.map(m => m.merk) || [])],
                bodyTypes: [...new Set(bodyTypes?.map(b => b.body_type) || [])]
            }))
        }

        async function checkUserLevel() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const level = await getUserLevel(user.id);
                const isApproved = await isUserApproved();
                console.log(isApproved)
                if (!isApproved.isApproved) {
                    router.push('/auth/pending');
                }
                setUserLevel(level);
            }
        }
        checkUserLevel();

        fetchUniqueValues()
    }, [])

    // Fetch cars with filters
    useEffect(() => {
        async function fetchCars() {
            setLoading(true)
            const supabase = createClient()
            
            let query = supabase
                .from('mobil')
                .select('*')
                .order('created_at', { ascending: false })

            // Apply filters
            if (filters.merk) query = query.eq('merk', filters.merk)
            if (filters.body_type) query = query.eq('body_type', filters.body_type)
            if (filters.status) query = query.eq('status', filters.status)
            if (filters.transmisi) query = query.eq('transmisi', filters.transmisi)
            if (filters.kondisi) query = query.eq('kondisi', filters.kondisi)
            if (filters.minHarga) query = query.gte('harga_jual', parseInt(filters.minHarga))
            if (filters.maxHarga) query = query.lte('harga_jual', parseInt(filters.maxHarga))
            if (filters.searchQuery) {
                query = query.or(`merk.ilike.%${filters.searchQuery}%,model.ilike.%${filters.searchQuery}%,series.ilike.%${filters.searchQuery}%`)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching cars:', error)
                return
            }

            setCarData(data || [])
            setLoading(false)
        }

        fetchCars()
    }, [filters])

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const resetFilters = () => {
        setFilters({
            merk: '',
            body_type: '',
            status: '',
            transmisi: '',
            kondisi: '',
            minHarga: '',
            maxHarga: '',
            searchQuery: ''
        })
    }

    return (
        <div className="container mx-auto p-4">
            {/* Filters Section */}
            <div className="bg-base-200 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FaFilter /> Filter Kendaraan
                    </h2>
                    <button 
                        onClick={resetFilters}
                        className="btn btn-sm btn-ghost"
                    >
                        Reset Filter
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Cari</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Merk, Model, atau Series..."
                                className="input input-bordered w-full pl-10"
                                value={filters.searchQuery}
                                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Merk Filter */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Merk</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={filters.merk}
                            onChange={(e) => handleFilterChange('merk', e.target.value)}
                        >
                            <option value="">Semua Merk</option>
                            {uniqueValues.merks.map((merk) => (
                                <option key={merk} value={merk}>{merk}</option>
                            ))}
                        </select>
                    </div>

                    {/* Body Type Filter */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Tipe Body</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={filters.body_type}
                            onChange={(e) => handleFilterChange('body_type', e.target.value)}
                        >
                            <option value="">Semua Tipe</option>
                            {uniqueValues.bodyTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Status</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            {uniqueValues.status.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Transmisi Filter */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Transmisi</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={filters.transmisi}
                            onChange={(e) => handleFilterChange('transmisi', e.target.value)}
                        >
                            <option value="">Semua Transmisi</option>
                            {uniqueValues.transmisi.map((trans) => (
                                <option key={trans} value={trans}>{trans}</option>
                            ))}
                        </select>
                    </div>

                    {/* Kondisi Filter */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Kondisi</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={filters.kondisi}
                            onChange={(e) => handleFilterChange('kondisi', e.target.value)}
                        >
                            <option value="">Semua Kondisi</option>
                            {uniqueValues.kondisi.map((kondisi) => (
                                <option key={kondisi} value={kondisi}>{kondisi}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Harga Minimum</span>
                        </label>
                        <input
                            type="number"
                            placeholder="Min. Harga"
                            className="input input-bordered w-full"
                            value={filters.minHarga}
                            onChange={(e) => handleFilterChange('minHarga', e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Harga Maximum</span>
                        </label>
                        <input
                            type="number"
                            placeholder="Max. Harga"
                            className="input input-bordered w-full"
                            value={filters.maxHarga}
                            onChange={(e) => handleFilterChange('maxHarga', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
            ) : (
                <>
                    {/* Results Count */}
                    <div className="mb-4">
                        <p className="text-gray-600">
                            Menampilkan {carData.length} kendaraan
                        </p>
                    </div>

                    {/* Car Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {carData.map((car) => (
                            <div key={car.id}>
                                <DashboardCarCard
                                    id={car.id}
                                    merk={car.merk}
                                    model={car.model}
                                    series={car.series}
                                    tahun={car.tahun}
                                    kilometer={car.kilometer}
                                    status={car.status}
                                    image_url={car.image_url || ""}
                                    transmisi={car.transmisi}
                                    kondisi={car.kondisi}
                                    plat_nomor={car.plat_nomor}
                                    harga_jual={car.harga_jual}
                                    warna={car.warna}
                                />
                            </div>
                        ))}
                    </div>

                    {/* No Results */}
                    {carData.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Tidak ada kendaraan yang ditemukan</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}