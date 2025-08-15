import { z } from 'zod';

// Company validation schema - matches companies table
export const companySchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyPhone: z
    .string()
    .regex(/^08\d{6,}$/, "Phone number must start with 08 and be at least 8 digits long"),
  companyEmail: z.email('Please enter a valid company email address'),
  companyAddress: z.string().min(5, 'Company address must be at least 5 characters'),
  companyLogo: z.any().optional(), // Allow File objects or strings
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  //slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/i, 'Slug can only contain letters, numbers, and hyphens'),
});

// Contact validation schema - matches users table
export const contactSchema = z.object({
  nama: z.string().min(2, 'Name must be at least 2 characters'),
  no_hp: z.string()
    .regex(/^08\d{6,}$/, "Phone number must start with 08 and be at least 8 digits long"),
});

// Join company validation schema
export const joinCompanySchema = z.object({
  companyId: z.string().uuid('Company ID must be a valid UUID'),
});

// Combined schemas for different flows
export const createCompanySchema = z.object({
  ...companySchema.shape,
  ...contactSchema.shape,
});

export const joinCompanyFlowSchema = joinCompanySchema;