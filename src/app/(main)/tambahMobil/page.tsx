'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCar, FaCalendarAlt, FaTachometerAlt, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';
import { MdDescription, MdColorLens, MdLocalGasStation } from 'react-icons/md';
import { IoSpeedometerOutline } from 'react-icons/io5';
import { insertCarData } from '@/app/lib/dbFunction';
import { toast } from 'react-hot-toast';

export default function TambahMobil() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    merk: '',
    tipe: '',
    model: '',
    series: '',
    body_type: '',
    variation: '',
    tahun: new Date().getFullYear(),
    plat_nomor: '',
    warna: '',
    transmisi: 'Manual',
    bahan_bakar: 'Bensin',
    kondisi: 'Baik',
    kilometer: 0,
    harga_beli: 0,
    harga_jual: 0,
    tanggal_beli: new Date().toISOString().split('T')[0],
    deskripsi: '',
    status: 'Tersedia',
    previous_owners: 1,
    registration_expiry: ''
  });

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

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await insertCarData(formData, selectedImage);
      
      if (result.success) {
        toast.success('Kendaraan berhasil ditambahkan');
        router.push('/dashboard');
      } else {
        toast.error('Gagal menambahkan kendaraan');
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Terjadi kesalahan saat menambahkan kendaraan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 text-gray-100 border border-gray-700">
        <div className="flex items-center mb-6">
          <FaCar className="text-primary text-3xl mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Tambah Mobil Baru</h1>
        </div>
        
        <p className="text-gray-300 mb-8">
          Isikan data kendaraan dengan lengkap dan benar untuk memudahkan proses penjualan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload Section */}
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

          <div className="divider divider-neutral">Informasi Dasar Kendaraan</div>

          {/* Basic Vehicle Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Merk <span className="text-red-400">*</span></span>
              </label>
              <input
                type="text"
                name="merk"
                value={formData.merk}
                onChange={handleInputChange}
                placeholder="contoh: Toyota, Honda, dll."
                className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Tipe <span className="text-red-400">*</span></span>
              </label>
              <input
                type="text"
                name="tipe"
                value={formData.tipe}
                onChange={handleInputChange}
                placeholder="contoh: Avanza, Civic, dll."
                className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Model <span className="text-red-400">*</span></span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="contoh: G, E, dll."
                className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Series</span>
              </label>
              <input
                type="text"
                name="series"
                value={formData.series}
                onChange={handleInputChange}
                placeholder="contoh: Type R, TRD, dll."
                className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Variasi</span>
              </label>
              <input
                type="text"
                name="variation"
                value={formData.variation}
                onChange={handleInputChange}
                placeholder="contoh: Sport, Limited, dll."
                className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Tipe Body <span className="text-red-400">*</span></span>
              </label>
              <select 
                name="body_type" 
                value={formData.body_type} 
                onChange={handleInputChange}
                className="select select-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                required
              >
                <option value="">Pilih Tipe Body</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="MPV">MPV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Pickup">Pickup</option>
                <option value="Van">Van</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Tahun <span className="text-red-400">*</span></span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="tahun"
                  value={formData.tahun}
                  onChange={handleInputChange}
                  placeholder="contoh: 2019"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                  required
                />
                <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Plat Nomor <span className="text-red-400">*</span></span>
              </label>
              <input
                type="text"
                name="plat_nomor"
                value={formData.plat_nomor}
                onChange={handleInputChange}
                placeholder="contoh: B 1234 ABC"
                className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Warna <span className="text-red-400">*</span></span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="warna"
                  value={formData.warna}
                  onChange={handleInputChange}
                  placeholder="contoh: Putih, Hitam, dll."
                  className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                  required
                />
                <MdColorLens className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="divider divider-neutral">Spesifikasi Teknis</div>

          {/* Technical Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Transmisi <span className="text-red-400">*</span></span>
              </label>
              <select 
                name="transmisi" 
                value={formData.transmisi} 
                onChange={handleInputChange}
                className="select select-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                required
              >
                <option value="Manual">Manual</option>
                <option value="Otomatis">Otomatis</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Bahan Bakar <span className="text-red-400">*</span></span>
              </label>
              <div className="relative">
                <select 
                  name="bahan_bakar" 
                  value={formData.bahan_bakar} 
                  onChange={handleInputChange}
                  className="select select-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                  required
                >
                  <option value="Bensin">Bensin</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Listrik">Listrik</option>
                </select>
                <MdLocalGasStation className="absolute right-10 top-3 text-gray-400" />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Kondisi <span className="text-red-400">*</span></span>
              </label>
              <select 
                name="kondisi" 
                value={formData.kondisi} 
                onChange={handleInputChange}
                className="select select-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                required
              >
                <option value="Sangat Baik">Sangat Baik</option>
                <option value="Baik">Baik</option>
                <option value="Cukup">Cukup</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Kilometer <span className="text-red-400">*</span></span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="kilometer"
                  value={formData.kilometer}
                  onChange={handleInputChange}
                  placeholder="contoh: 50000"
                  min="0"
                  className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                  required
                />
                <FaTachometerAlt className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Jumlah Pemilik Sebelumnya</span>
              </label>
              <input
                type="number"
                name="previous_owners"
                value={formData.previous_owners}
                onChange={handleInputChange}
                placeholder="contoh: 1"
                min="1"
                className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Tanggal Habis STNK</span>
              </label>
              <input
                type="date"
                name="registration_expiry"
                value={formData.registration_expiry}
                onChange={handleInputChange}
                className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
              />
            </div>
          </div>

          <div className="divider divider-neutral">Informasi Harga dan Pembelian</div>

          {/* Price and Purchase Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Harga Beli <span className="text-red-400">*</span></span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="harga_beli"
                  value={formData.harga_beli}
                  onChange={handleInputChange}
                  placeholder="contoh: 150000000"
                  min="0"
                  className="input input-bordered bg-gray-700 text-gray-100 w-full pl-8 border-gray-600 focus:border-primary"
                  required
                />
                <span className="absolute left-3 top-3 text-gray-400">Rp</span>
                <FaMoneyBillWave className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Harga Jual</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="harga_jual"
                  value={formData.harga_jual}
                  onChange={handleInputChange}
                  placeholder="contoh: 180000000"
                  min="0"
                  className="input input-bordered bg-gray-700 text-gray-100 w-full pl-8 border-gray-600 focus:border-primary"
                />
                <span className="absolute left-3 top-3 text-gray-400">Rp</span>
                <FaMoneyBillWave className="absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-200 font-medium">Tanggal Beli <span className="text-red-400">*</span></span>
              </label>
              <input
                type="date"
                name="tanggal_beli"
                value={formData.tanggal_beli}
                onChange={handleInputChange}
                className="input input-bordered bg-gray-700 text-gray-100 w-full border-gray-600 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-200 font-medium">Deskripsi</span>
            </label>
            <div className="relative">
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                placeholder="Masukkan deskripsi detail kendaraan, seperti kondisi mesin, kelebihan, dan kekurangan"
                className="textarea textarea-bordered bg-gray-700 text-gray-100 w-full h-32 border-gray-600 focus:border-primary"
              ></textarea>
              <MdDescription className="absolute right-3 top-3 text-gray-400" />
            </div>
            <label className="label">
              <span className="label-text-alt text-gray-400 flex items-center">
                <FaInfoCircle className="mr-1" /> Deskripsi yang baik dapat meningkatkan peluang penjualan
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-8">
            <button 
              type="button" 
              className="btn btn-outline btn-gray text-gray-300 hover:bg-gray-700 hover:text-white border-gray-500"
              onClick={() => router.back()}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn btn-primary min-w-40"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : 'Simpan Kendaraan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
