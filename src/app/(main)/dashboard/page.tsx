"use client"

import { useEffect, useState } from "react"
import { CarInterface } from "@/app/type/car/carInterface"
import DashboardCarCard from "@/app/components/ui/DashboardCarCard"
import { createClient } from "@/app/utils/supabase/client"
import { FaFilter, FaSearch, FaTimes, FaSort } from "react-icons/fa"
import { getUserLevel } from "@/app/lib/dbFunction"
import { isUserApproved } from "@/app/lib/auth"
import { useRouter } from "next/navigation"
import { formatPrice } from "../../utils/functions/utilFunctions"

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

interface SortOption {
    field: string;
    direction: 'asc' | 'desc';
    label: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [carData, setCarData] = useState<CarInterface[]>([])
    const [loading, setLoading] = useState(true)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [activeFiltersCount, setActiveFiltersCount] = useState(0)
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
    const [sortOption, setSortOption] = useState<SortOption>({
        field: 'created_at',
        direction: 'desc',
        label: 'Terbaru'
    })
    
    const sortOptions: SortOption[] = [
        { field: 'created_at', direction: 'desc', label: 'Terbaru' },
        { field: 'created_at', direction: 'asc', label: 'Terlama' },
        { field: 'harga_jual', direction: 'asc', label: 'Harga: Terendah' },
        { field: 'harga_jual', direction: 'desc', label: 'Harga: Tertinggi' },
        { field: 'tahun', direction: 'desc', label: 'Tahun: Terbaru' },
        { field: 'tahun', direction: 'asc', label: 'Tahun: Terlama' },
        { field: 'kilometer', direction: 'asc', label: 'KM: Terendah' },
        { field: 'kilometer', direction: 'desc', label: 'KM: Tertinggi' },
    ]

    useEffect(() => {
        // Check if this is mobile view
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setFiltersOpen(true);
            } else {
                setFiltersOpen(false);
            }
        };
        
        // Initialize filter state based on window size
        handleResize();
        
        // Add event listener
        window.addEventListener("resize", handleResize);
        
        // Clean up
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Calculate active filters count
    useEffect(() => {
        let count = 0;
        if (filters.merk) count++;
        if (filters.body_type) count++;
        if (filters.status) count++;
        if (filters.transmisi) count++;
        if (filters.kondisi) count++;
        if (filters.minHarga) count++;
        if (filters.maxHarga) count++;
        if (filters.searchQuery) count++;
        
        setActiveFiltersCount(count);
    }, [filters]);

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
                merks: [...new Set(merks?.map(m => m.merk).filter(Boolean) || [])],
                bodyTypes: [...new Set(bodyTypes?.map(b => b.body_type).filter(Boolean) || [])]
            }))
        }

        async function checkUserLevel() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const level = await getUserLevel(user.id);
                    const isApproved = await isUserApproved();
                    if (!isApproved.isApproved) {
                        router.push('/auth/pending');
                    }
                    setUserLevel(level);
                }
            } catch (error) {
                console.error("Error checking user level:", error);
            }
        }
        
        checkUserLevel();
        fetchUniqueValues();
    }, [router])

    // Fetch cars with filters
    useEffect(() => {
        async function fetchCars() {
            setLoading(true)
            const supabase = createClient()
            
            let query = supabase
                .from('mobil')
                .select('*')
                .order(sortOption.field, { ascending: sortOption.direction === 'asc' })

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

            try {
                const { data, error } = await query
                if (error) {
                    console.error('Error fetching cars:', error)
                    return
                }
                setCarData(data || [])
            } catch (err) {
                console.error('Exception fetching cars:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchCars()
    }, [filters, sortOption])

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

    const toggleFilters = () => {
        setFiltersOpen(!filtersOpen);
    }

    const handleClearFilter = (key: keyof FilterState) => {
        setFilters(prev => ({
            ...prev,
            [key]: ''
        }));
    }

    const renderActiveFilters = () => {
        if (activeFiltersCount === 0) return null;
        
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(filters).map(([key, value]) => {
                    if (!value) return null;
                    
                    let displayValue = value;
                    let displayKey = key;
                    
                    // Format display text
                    switch(key) {
                        case 'merk': displayKey = 'Merk'; break;
                        case 'body_type': displayKey = 'Tipe Body'; break;
                        case 'status': displayKey = 'Status'; break;
                        case 'transmisi': displayKey = 'Transmisi'; break;
                        case 'kondisi': displayKey = 'Kondisi'; break;
                        case 'minHarga': 
                            displayKey = 'Min Harga'; 
                            displayValue = formatPrice(parseInt(value));
                            break;
                        case 'maxHarga': 
                            displayKey = 'Max Harga'; 
                            displayValue = formatPrice(parseInt(value));
                            break;
                        case 'searchQuery': displayKey = 'Pencarian'; break;
                    }
                    
                    return (
                        <div 
                            key={key}
                            className="badge badge-accent gap-2 p-3 flex items-center"
                        >
                            <span>{displayKey}: {displayValue}</span>
                            <button 
                                onClick={() => handleClearFilter(key as keyof FilterState)}
                                className="bg-accent-focus hover:bg-accent-focus/80 rounded-full p-1"
                            >
                                <FaTimes size={10} />
                            </button>
                        </div>
                    );
                })}
                {activeFiltersCount > 0 && (
                    <button 
                        onClick={resetFilters}
                        className="badge badge-neutral gap-2 p-3"
                    >
                        Reset Semua
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                {/* Search Bar */}
                <div className="relative flex-grow max-w-md">
                    <input
                        type="text"
                        placeholder="Cari merk, model, atau series..."
                        className="input input-bordered w-full pl-10 pr-4"
                        value={filters.searchQuery}
                        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    {filters.searchQuery && (
                        <button 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            onClick={() => handleFilterChange('searchQuery', '')}
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
                
                {/* Filter and Sort Controls */}
                <div className="flex gap-2">
                    {/* Sort Dropdown */}
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-outline gap-2 w-40">
                            <FaSort /> {sortOption.label}
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow text-white bg-base-100 rounded-box w-40">
                            {sortOptions.map((option) => (
                                <li key={`${option.field}-${option.direction}`}>
                                    <button 
                                        className={sortOption.field === option.field && sortOption.direction === option.direction ? 'active' : ''}
                                        onClick={() => setSortOption(option)}
                                    >
                                        {option.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Filter Toggle Button */}
                    <button 
                        onClick={toggleFilters}
                        className="btn btn-outline gap-2 relative"
                    >
                        <FaFilter /> Filter
                        {activeFiltersCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-accent text-accent-content w-5 h-5 rounded-full flex items-center justify-center text-xs">
                                {activeFiltersCount}
                            </div>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Active Filters Display */}
            {renderActiveFilters()}

            {/* Filters Panel - Collapsible on mobile */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${filtersOpen ? 'max-h-[2000px] opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
                <div className="bg-base-200 p-4 rounded-lg mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Min. Harga"
                                    className="input input-bordered w-full pr-8"
                                    value={filters.minHarga}
                                    onChange={(e) => handleFilterChange('minHarga', e.target.value)}
                                />
                                {filters.minHarga && (
                                    <button 
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => handleFilterChange('minHarga', '')}
                                    >
                                        <FaTimes size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Harga Maksimum</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Max. Harga"
                                    className="input input-bordered w-full pr-8"
                                    value={filters.maxHarga}
                                    onChange={(e) => handleFilterChange('maxHarga', e.target.value)}
                                />
                                {filters.maxHarga && (
                                    <button 
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => handleFilterChange('maxHarga', '')}
                                    >
                                        <FaTimes size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Apply Filters Button */}
                    <div className="mt-4 md:hidden">
                        <button 
                            onClick={toggleFilters}
                            className="btn btn-primary w-full"
                        >
                            Terapkan Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col justify-center items-center h-64 gap-4">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="text-gray-500">Memuat data kendaraan...</p>
                </div>
            ) : (
                <>
                    {/* Results Count */}
                    <div className="mb-4 mt-6">
                        <p className="text-gray-600">
                            Menampilkan {carData.length} kendaraan {activeFiltersCount > 0 ? 'dengan filter aktif' : ''}
                        </p>
                    </div>

                    {/* Car Grid */}
                    <div className="grid grid-cols-1 min-w-full sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {carData.map((car) => (
                            <div key={car.id} className="animate-fadeIn">
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
                        <div className="text-center py-16 bg-base-200 rounded-lg">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold">Tidak ada kendaraan yang ditemukan</h3>
                            <p className="text-gray-500 mt-2">Coba ubah filter atau hapus beberapa kriteria pencarian</p>
                            {activeFiltersCount > 0 && (
                                <button 
                                    onClick={resetFilters}
                                    className="btn btn-outline mt-4"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}            
        </div>
    )
}