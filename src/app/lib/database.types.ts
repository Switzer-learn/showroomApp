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
          company_id: string | null
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
          company_id?: string | null
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
          company_id?: string | null
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
          company_id: string | null
          first_name: string | null
          last_name: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_approved?: boolean
          role?: string | null
          created_at?: string
          company_id?: string | null
          first_name?: string | null
          last_name?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_approved?: boolean
          role?: string | null
          created_at?: string
          company_id?: string | null
          first_name?: string | null
          last_name?: string | null
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          business_type: string | null
          tax_id: string | null
          website_url: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          province: string | null
          postal_code: string | null
          country: string
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          business_type?: string | null
          tax_id?: string | null
          website_url?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          country?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          business_type?: string | null
          tax_id?: string | null
          website_url?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          country?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      company_settings: {
        Row: {
          id: string
          company_id: string
          currency_code: string
          accounting_start_date: string
          fiscal_year_start: string
          timezone: string
          language: string
          date_format: string
          enable_multi_branch: boolean
          enable_workshop_module: boolean
          enable_accounting_module: boolean
          primary_color: string
          secondary_color: string
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          currency_code?: string
          accounting_start_date?: string
          fiscal_year_start?: string
          timezone?: string
          language?: string
          date_format?: string
          enable_multi_branch?: boolean
          enable_workshop_module?: boolean
          enable_accounting_module?: boolean
          primary_color?: string
          secondary_color?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          currency_code?: string
          accounting_start_date?: string
          fiscal_year_start?: string
          timezone?: string
          language?: string
          date_format?: string
          enable_multi_branch?: boolean
          enable_workshop_module?: boolean
          enable_accounting_module?: boolean
          primary_color?: string
          secondary_color?: string
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      onboarding_progress: {
        Row: {
          id: string
          user_id: string
          current_step: number
          completed_steps: number[]
          company_data: Json | null
          contact_data: Json | null
          business_data: Json | null
          preferences_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_step?: number
          completed_steps?: number[]
          company_data?: Json | null
          contact_data?: Json | null
          business_data?: Json | null
          preferences_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_step?: number
          completed_steps?: number[]
          company_data?: Json | null
          contact_data?: Json | null
          business_data?: Json | null
          preferences_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          car_id: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          customer_address: string | null
          sale_price: number
          sale_date: string
          payment_method: string
          notes: string | null
          created_at: string
          company_id: string | null
        }
        Insert: {
          id?: string
          car_id: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          customer_address?: string | null
          sale_price: number
          sale_date: string
          payment_method: string
          notes?: string | null
          created_at?: string
          company_id?: string | null
        }
        Update: {
          id?: string
          car_id?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          customer_address?: string | null
          sale_price?: number
          sale_date?: string
          payment_method?: string
          notes?: string | null
          created_at?: string
          company_id?: string | null
        }
      }
      purchases: {
        Row: {
          id: string
          car_id: string
          seller_name: string
          seller_phone: string
          seller_email: string | null
          seller_address: string | null
          purchase_price: number
          purchase_date: string
          payment_method: string
          notes: string | null
          created_at: string
          company_id: string | null
        }
        Insert: {
          id?: string
          car_id: string
          seller_name: string
          seller_phone: string
          seller_email?: string | null
          seller_address?: string | null
          purchase_price: number
          purchase_date: string
          payment_method: string
          notes?: string | null
          created_at?: string
          company_id?: string | null
        }
        Update: {
          id?: string
          car_id?: string
          seller_name?: string
          seller_phone?: string
          seller_email?: string | null
          seller_address?: string | null
          purchase_price?: number
          purchase_date?: string
          payment_method?: string
          notes?: string | null
          created_at?: string
          company_id?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          type: string
          amount: number
          description: string
          transaction_date: string
          category: string
          reference_id: string | null
          created_at: string
          company_id: string | null
        }
        Insert: {
          id?: string
          type: string
          amount: number
          description: string
          transaction_date: string
          category: string
          reference_id?: string | null
          created_at?: string
          company_id?: string | null
        }
        Update: {
          id?: string
          type?: string
          amount?: number
          description?: string
          transaction_date?: string
          category?: string
          reference_id?: string | null
          created_at?: string
          company_id?: string | null
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
