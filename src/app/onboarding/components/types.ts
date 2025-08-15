export interface FormData {
  // Company Setup & Details
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogo: File | string | null;
  website: string;
  slug: string;

  // Contact Details
  nama: string;
  email: string;
  no_hp: string;

  // Optional Branding (set by admin)
  primaryColor: string;
  secondaryColor: string;

  // Join Company
  companyId: string;
}

export interface Step {
  id: string;
  title: string;
  icon: string;
}

export interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
}

export interface BusinessType {
  value: string;
  label: string;
}

export interface Currency {
  code: string;
  name: string;
}

export interface Timezone {
  value: string;
  label: string;
}

export interface StepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: any) => void;
  errors?: Record<string, string>;
}

export interface ChoiceStepProps {
  onChoiceSelect: (choice: 'create' | 'join') => void;
}

export interface CompleteStepProps {
  onComplete: () => void;
}