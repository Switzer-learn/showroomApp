import { ColorPreset, BusinessType, Currency, Timezone } from './types';

export const colorPresets: ColorPreset[] = [
  { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#1E40AF' },
  { name: 'Emerald', primary: '#10B981', secondary: '#047857' },
  { name: 'Purple', primary: '#8B5CF6', secondary: '#7C3AED' },
  { name: 'Rose', primary: '#F43F5E', secondary: '#E11D48' },
  { name: 'Amber', primary: '#F59E0B', secondary: '#D97706' },
  { name: 'Teal', primary: '#14B8A6', secondary: '#0F766E' },
];

export const businessTypes: BusinessType[] = [
  { value: 'dealer', label: 'Car Dealer' },
  { value: 'showroom', label: 'Car Showroom' },
  { value: 'workshop', label: 'Car Workshop' },
  { value: 'other', label: 'Other' }
];

export const currencies: Currency[] = [
  { code: 'IDR', name: 'Indonesian Rupiah (Rp)' },
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'SGD', name: 'Singapore Dollar (S$)' },
];

export const timezones: Timezone[] = [
  { value: 'Asia/Jakarta', label: 'WIB (Western Indonesia Time)' },
  { value: 'Asia/Makassar', label: 'WITA (Central Indonesia Time)' },
  { value: 'Asia/Jayapura', label: 'WIT (Eastern Indonesia Time)' },
];

export const steps = [
  { id: 'choice', title: 'Get Started', icon: 'Building2' },
  { id: 'join', title: 'Join Company', icon: 'Users' },
  { id: 'company', title: 'Company Setup', icon: 'Building' },
  { id: 'contact', title: 'Contact Details', icon: 'User' },
  { id: 'business', title: 'Business Settings', icon: 'Settings' },
  { id: 'preferences', title: 'Preferences', icon: 'Palette' },
  { id: 'complete', title: 'Complete', icon: 'Check' }
];