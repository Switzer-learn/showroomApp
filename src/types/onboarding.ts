// Onboarding Types and Interfaces
import { z } from 'zod';

// Step 1: Company Setup Schema
export const companySetupSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  businessType: z.enum(['dealer', 'showroom', 'workshop', 'other']),
  taxId: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
});

// Step 2: Contact Details Schema
export const contactDetailsSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().min(5, 'Postal code must be at least 5 characters'),
});

// Step 3: Business Settings Schema
export const businessSettingsSchema = z.object({
  currencyCode: z.string().default('IDR'),
  accountingStartDate: z.string().min(1, 'Accounting start date is required'),
  fiscalYearStart: z.string().optional(),
  timezone: z.string().default('Asia/Jakarta'),
  language: z.string().default('id'),
  dateFormat: z.string().default('DD/MM/YYYY'),
});

// Step 4: Preferences Schema
export const preferencesSchema = z.object({
  enableMultiBranch: z.boolean().default(false),
  enableWorkshopModule: z.boolean().default(false),
  enableAccountingModule: z.boolean().default(true),
  primaryColor: z.string().default('#3B82F6'),
  secondaryColor: z.string().default('#1E40AF'),
});

// Complete onboarding data
export const onboardingSchema = z.object({
  companySetup: companySetupSchema,
  contactDetails: contactDetailsSchema,
  businessSettings: businessSettingsSchema,
  preferences: preferencesSchema,
});

// Types
export type CompanySetupData = z.infer<typeof companySetupSchema>;
export type ContactDetailsData = z.infer<typeof contactDetailsSchema>;
export type BusinessSettingsData = z.infer<typeof businessSettingsSchema>;
export type PreferencesData = z.infer<typeof preferencesSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  isCompleted: boolean;
}

export interface OnboardingState {
  data: Partial<OnboardingData>;
  progress: OnboardingProgress;
  loading: boolean;
  error: string | null;
}