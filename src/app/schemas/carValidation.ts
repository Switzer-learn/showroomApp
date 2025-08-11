import { z } from 'zod';

// Define the car form validation schema
export const carFormSchema = z.object({
  // Basic Vehicle Information
  merk: z.string()
    .min(1, 'Merk kendaraan wajib diisi')
    .min(2, 'Merk minimal 2 karakter')
    .max(50, 'Merk maksimal 50 karakter'),
  
  tipe: z.string()
    .min(1, 'Tipe kendaraan wajib diisi')
    .min(2, 'Tipe minimal 2 karakter')
    .max(50, 'Tipe maksimal 50 karakter'),
  
  model: z.string()
    .min(1, 'Model kendaraan wajib diisi')
    .min(1, 'Model minimal 1 karakter')
    .max(50, 'Model maksimal 50 karakter'),
  
  series: z.string()
    .max(50, 'Series maksimal 50 karakter')
    .optional()
    .or(z.literal('')),
  
  body_type: z.enum(['Sedan', 'SUV', 'MPV', 'Hatchback', 'Pickup', 'Van'], {
    message: 'Tipe body wajib dipilih'
  }),
  
  variation: z.string()
    .max(50, 'Variasi maksimal 50 karakter')
    .optional()
    .or(z.literal('')),
  
  tahun: z.number({
    message: 'Tahun kendaraan wajib diisi dan harus berupa angka'
  })
    .int('Tahun harus berupa bilangan bulat')
    .min(1900, 'Tahun minimal 1900')
    .max(new Date().getFullYear(), `Tahun maksimal ${new Date().getFullYear()}`),
  
  plat_nomor: z.string()
    .min(1, 'Plat nomor wajib diisi')
    .min(3, 'Plat nomor minimal 3 karakter')
    .max(15, 'Plat nomor maksimal 15 karakter')
    .regex(/^[A-Z0-9\s]+$/i, 'Plat nomor hanya boleh mengandung huruf, angka, dan spasi'),
  
  warna: z.string()
    .min(1, 'Warna kendaraan wajib diisi')
    .min(2, 'Warna minimal 2 karakter')
    .max(30, 'Warna maksimal 30 karakter'),

  // Technical Specifications
  transmisi: z.enum(['Manual', 'Otomatis'], {
    message: 'Transmisi wajib dipilih'
  }),
  
  bahan_bakar: z.enum(['Bensin', 'Diesel', 'Listrik'], {
    message: 'Bahan bakar wajib dipilih'
  }),
  
  kondisi: z.enum(['Sangat Baik', 'Baik', 'Cukup', 'Rusak Ringan'], {
    message: 'Kondisi kendaraan wajib dipilih'
  }),
  
  kilometer: z.number({
    message: 'Kilometer wajib diisi dan harus berupa angka'
  })
    .int('Kilometer harus berupa bilangan bulat')
    .min(0, 'Kilometer tidak boleh negatif')
    .max(9999999, 'Kilometer terlalu besar'),
  
  previous_owners: z.number({
    message: 'Jumlah pemilik sebelumnya harus berupa angka'
  })
    .int('Jumlah pemilik harus berupa bilangan bulat')
    .min(1, 'Minimal 1 pemilik sebelumnya')
    .max(10, 'Maksimal 10 pemilik sebelumnya')
    .default(1),
  
  registration_expiry: z.string()
    .optional()
    .or(z.literal(''))
    .refine((date) => {
      if (!date || date === '') return true;
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Tanggal habis STNK tidak boleh di masa lalu'),

  // Price and Purchase Information
  harga_beli: z.number({
    message: 'Harga beli wajib diisi dan harus berupa angka'
  })
    .min(1000000, 'Harga beli minimal Rp 1.000.000')
    .max(50000000000, 'Harga beli maksimal Rp 50.000.000.000'),
  
  harga_jual: z.number({
    message: 'Harga jual harus berupa angka'
  })
    .min(0, 'Harga jual tidak boleh negatif')
    .max(50000000000, 'Harga jual maksimal Rp 50.000.000.000')
    .default(0),
  
  tanggal_beli: z.string()
    .min(1, 'Tanggal beli wajib diisi')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return selectedDate <= today;
    }, 'Tanggal beli tidak boleh di masa depan'),

  // Description and Status
  deskripsi: z.string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional()
    .or(z.literal('')),
  
  status: z.enum(['Tersedia', 'Terjual', 'Dalam Proses'], {
    message: 'Status kendaraan wajib dipilih'
  }).default('Tersedia')
}).refine((data) => {
  // Custom validation: harga_jual should be greater than harga_beli if provided
  if (data.harga_jual > 0 && data.harga_jual <= data.harga_beli) {
    return false;
  }
  return true;
}, {
  message: 'Harga jual harus lebih besar dari harga beli',
  path: ['harga_jual']
});

// Type inference from schema
export type CarFormData = z.infer<typeof carFormSchema>;

// Validation function - image is handled separately and is optional
export const validateCarForm = (data: any) => {
  return carFormSchema.safeParse(data);
};

// Individual field validation for real-time feedback
export const validateField = (fieldName: keyof CarFormData, value: any) => {
  try {
    const fieldSchema = carFormSchema.shape[fieldName];
    return fieldSchema.safeParse(value);
  } catch (error) {
    return { success: false, error: { issues: [{ message: 'Invalid field' }] } };
  }
};