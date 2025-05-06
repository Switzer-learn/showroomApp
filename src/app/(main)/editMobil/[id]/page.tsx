"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"
import { getUserLevel } from "@/app/lib/dbFunction"
import { Car } from "@/app/types/car"

interface EditCarFormData {
    merk: string;
    model: string;
    series: string;
    tahun: number;
    kilometer: number;
    transmisi: string;
    kondisi: string;
    plat_nomor: string;
    harga_jual: number;
    warna: string;
    body_type: string;
    image_url: string;
}

export default function EditCarPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [userLevel, setUserLevel] = useState<'admin' | 'sales' | null>(null)
    const [carData, setCarData] = useState<Car | null>(null)
    const [formData, setFormData] = useState<EditCarFormData>({
        merk: '',
        model: '',
        series: '',
        tahun: 0,
        kilometer: 0,
        transmisi: '',
        kondisi: '',
        plat_nomor: '',
        harga_jual: 0,
        warna: '',
        body_type: '',
        image_url: ''
    })

    useEffect(() => {
        async function checkUserLevel() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const level = await getUserLevel(user.id);
                setUserLevel(level);
                if (level !== 'admin') {
                    router.push('/dashboard');
                }
            }
        }
        checkUserLevel();
    }, [router]);

    useEffect(() => {
        async function fetchCarData() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('mobil')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error) {
                console.error('Error fetching car:', error);
                router.push('/dashboard');
                return;
            }

            if (data) {
                setCarData(data);
                setFormData({
                    merk: data.merk,
                    model: data.model,
                    series: data.series,
                    tahun: data.tahun,
                    kilometer: data.kilometer,
                    transmisi: data.transmisi,
                    kondisi: data.kondisi,
                    plat_nomor: data.plat_nomor,
                    harga_jual: data.harga_jual,
                    warna: data.warna,
                    body_type: data.body_type,
                    image_url: data.image_url
                });
            }
            setIsLoading(false);
        }

        fetchCarData();
    }, [params.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('mobil')
                .update({
                    merk: formData.merk,
                    model: formData.model,
                    series: formData.series,
                    tahun: formData.tahun,
                    kilometer: formData.kilometer,
                    transmisi: formData.transmisi,
                    kondisi: formData.kondisi,
                    plat_nomor: formData.plat_nomor,
                    harga_jual: formData.harga_jual,
                    warna: formData.warna,
                    body_type: formData.body_type,
                    image_url: formData.image_url
                })
                .eq('id', params.id);

            if (error) throw error;

            router.push('/dashboard');
        } catch (error) {
            console.error('Error updating car:', error);
            alert('Failed to update car. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Edit Car</h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Merk</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.merk}
                                onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Model</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Series</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.series}
                                onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Tahun</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered"
                                value={formData.tahun}
                                onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Kilometer</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered"
                                value={formData.kilometer}
                                onChange={(e) => setFormData({ ...formData, kilometer: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Transmisi</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={formData.transmisi}
                                onChange={(e) => setFormData({ ...formData, transmisi: e.target.value })}
                                required
                            >
                                <option value="">Pilih Transmisi</option>
                                <option value="Manual">Manual</option>
                                <option value="Automatic">Automatic</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Kondisi</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={formData.kondisi}
                                onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
                                required
                            >
                                <option value="">Pilih Kondisi</option>
                                <option value="Baru">Baru</option>
                                <option value="Bekas">Bekas</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Plat Nomor</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.plat_nomor}
                                onChange={(e) => setFormData({ ...formData, plat_nomor: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Harga Jual</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered"
                                value={formData.harga_jual}
                                onChange={(e) => setFormData({ ...formData, harga_jual: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Warna</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.warna}
                                onChange={(e) => setFormData({ ...formData, warna: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Body Type</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.body_type}
                                onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Image URL</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => router.push('/dashboard')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
