"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PenjualanMobil from "./modal/PenjualanMobil"
import { getUserLevel } from "@/app/lib/dbFunction"
import { createClient } from "@/app/utils/supabase/client"
import { deleteCarById } from "@/app/lib/dbFunction"
import { FaEdit, FaTrash } from "react-icons/fa"

interface DashboardCarCard {
    id: string;
    merk: string;
    model: string;
    series: string;
    tahun: number;
    kilometer: number;
    status: string;
    image_url: string;
    transmisi: string;
    kondisi: string;
    plat_nomor: string;
    harga_jual: number;
    warna: string;
}

export default function DashboardCarCard(props: DashboardCarCard) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [userLevel, setUserLevel] = useState<'admin' | 'sales' | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    useEffect(() => {
        async function checkUserLevel() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const level = await getUserLevel(user.id);
                setUserLevel(level);
            }
        }
        checkUserLevel();
    }, []);

    // Format currency to IDR
    const formatHargaJual = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(props.harga_jual);

    // Format kilometer with dots
    const formatKilometer = new Intl.NumberFormat('id-ID').format(props.kilometer);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this car?')) {
            setIsDeleting(true);
            try {
                const result = await deleteCarById(props.id);
                if (result.success) {
                    window.location.reload();
                } else {
                    alert(result.error || 'Failed to delete car');
                }
            } catch (error) {
                alert('An error occurred while deleting the car');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleEdit = () => {
        router.push(`/editMobil/${props.id}`);
    };

    return (
        <>
            <div className="card bg-base-100 w-64 md:w-80 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <figure className="relative h-48 overflow-hidden">
                    <img
                        src={props.image_url}
                        alt={`${props.merk} ${props.model}`}
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-0 right-0 px-3 py-1 m-2 rounded-md text-sm font-medium ${
                        props.status === 'Terjual' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-green-500 text-white'
                    }`}>
                        {props.status}
                    </div>
                </figure>
                
                <div className="card-body p-5">
                    <h2 className="card-title text-lg font-bold mb-2">
                        {props.merk} {props.model} {props.series} {props.tahun} {props.warna}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>{formatKilometer} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>{props.transmisi}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{props.kondisi}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <span>{props.plat_nomor}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col justify-between mt-2">
                        <p className="text-lg font-bold text-primary">{formatHargaJual}</p>
                        <div className="flex gap-2">
                            <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => setIsModalOpen(true)}
                                disabled={props.status === 'Terjual' || userLevel !== 'admin'}
                            >
                                {props.status === 'Terjual' ? 'Terjual' : 'Mark as Sold'}
                            </button>
                            {userLevel === 'admin' && (
                                <>
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={handleEdit}
                                        disabled={isDeleting}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-error btn-sm"
                                        onClick={handleDelete}
                                        disabled={isDeleting || props.status === 'Terjual'}
                                    >
                                        <FaTrash />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <PenjualanMobil
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                carData={{
                    id: props.id,
                    merk: props.merk,
                    model: props.model,
                    series: props.series,
                    plat_nomor: props.plat_nomor,
                    harga_jual: props.harga_jual
                }}
            />
        </>
    );
}