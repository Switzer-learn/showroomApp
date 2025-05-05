export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mobil: {
        Row: {
          id: string
          merk: string | null
          tipe: string | null
          model: string | null
          series: string | null
          body_type: string | null
          variation: string | null
          tahun: number | null
          plat_nomor: string | null
          warna: string | null
          transmisi: string | null
          bahan_bakar: string | null
          kondisi: string | null
          kilometer: number | null
          harga_beli: number | null
          harga_jual: number | null
          tanggal_beli: string | null
          deskripsi: string | null
          status: string | null
          image_url: string | null
          previous_owners: number | null
          registration_expiry: string | null
          created_at: string
        }
        Insert: {
          id?: string
          merk?: string | null
          tipe?: string | null
          model?: string | null
          series?: string | null
          body_type?: string | null
          variation?: string | null
          tahun?: number | null
          plat_nomor?: string | null
          warna?: string | null
          transmisi?: string | null
          bahan_bakar?: string | null
          kondisi?: string | null
          kilometer?: number | null
          harga_beli?: number | null
          harga_jual?: number | null
          tanggal_beli?: string | null
          deskripsi?: string | null
          status?: string | null
          image_url?: string | null
          previous_owners?: number | null
          registration_expiry?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          merk?: string | null
          tipe?: string | null
          model?: string | null
          series?: string | null
          body_type?: string | null
          variation?: string | null
          tahun?: number | null
          plat_nomor?: string | null
          warna?: string | null
          transmisi?: string | null
          bahan_bakar?: string | null
          kondisi?: string | null
          kilometer?: number | null
          harga_beli?: number | null
          harga_jual?: number | null
          tanggal_beli?: string | null
          deskripsi?: string | null
          status?: string | null
          image_url?: string | null
          previous_owners?: number | null
          registration_expiry?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          is_approved: boolean
          role: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_approved?: boolean
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_approved?: boolean
          role?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
