"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"
import { getUserLevel } from "@/app/lib/dbFunction"
import { Car } from "@/app/types/car"
import { toast } from 'react-hot-toast'
import { use } from "react"

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

export default function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [userLevel, setUserLevel] = useState<'admin' | 'sales' | null>(null)
    const [carData, setCarData] = useState<Car | null>(null)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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
                .eq('id', resolvedParams.id)
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
                // Set preview URL for existing image
                if (data.image_url) {
                    setPreviewUrl(data.image_url);
                }
            }
            setIsLoading(false);
        }

        fetchCarData();
    }, [resolvedParams.id, router]);

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);

            // Create a preview URL
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const supabase = createClient();
            let imageUrl = formData.image_url;

            // If there's a new image selected, upload it
            if (selectedImage) {
                const fileExt = selectedImage.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('gambar-mobil')
                    .upload(filePath, selectedImage);

                if (uploadError) {
                    throw uploadError;
                }

                // Get the public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('gambar-mobil')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

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
                    image_url: imageUrl
                })
                .eq('id', resolvedParams.id);

            if (error) throw error;

            toast.success('Kendaraan berhasil diperbarui');
            router.push('/dashboard');
        } catch (error) {
            console.error('Error updating car:', error);
            toast.error('Gagal memperbarui kendaraan');
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

                {/* Image Upload Section - Moved to top */}
                <div className="mb-8">
                    <label className="label">
                        <span className="label-text font-semibold">Foto Kendaraan</span>
                    </label>
                    <div className="p-6 border border-dashed border-gray-600 rounded-lg bg-gray-900">
                        <div className="flex flex-col items-center justify-center">
                            {previewUrl ? (
                                <div className="mb-4 relative">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full max-w-md h-64 object-cover rounded-lg shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setPreviewUrl(null);
                                            setFormData(prev => ({ ...prev, image_url: '' }));
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-300">Klik untuk unggah foto utama kendaraan</p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG atau GIF (Maks. 5MB)</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className={previewUrl ? "hidden" : "absolute inset-0 w-full h-full opacity-0 cursor-pointer"}
                            />
                            {!previewUrl && (
                                <button type="button" className="mt-4 btn btn-outline btn-primary">
                                    Pilih Foto
                                </button>
                            )}
                        </div>
                    </div>
                </div>

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
                                <option value="" disabled>Pilih Kondisi</option>
                                <option value="Sangat Baik">Sangat Baik</option>
                                <option value="Baik">Baik</option>
                                <option value="Cukup">Cukup</option>
                                <option value="Rusak Ringan">Rusak Ringan</option>
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
