import { ZodError } from 'zod';

// Type for validation errors
export interface ValidationErrors {
  [key: string]: string;
}

// Extract validation errors from Zod error
export const extractValidationErrors = (error: ZodError): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });
  
  return errors;
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Parse currency string to number
export const parseCurrency = (value: string): number => {
  return parseInt(value.replace(/[^\d]/g, '')) || 0;
};

// Validate single field
export const validateSingleField = (
  fieldName: string,
  value: any,
  schema: any
): string | null => {
  try {
    const fieldSchema = schema.shape[fieldName];
    fieldSchema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof ZodError) {
      return error.issues[0]?.message || 'Invalid value';
    }
    return 'Validation error';
  }
};

// Check if field has error
export const hasFieldError = (
  fieldName: string,
  errors: ValidationErrors
): boolean => {
  return fieldName in errors;
};

// Get field error message
export const getFieldError = (
  fieldName: string,
  errors: ValidationErrors
): string | undefined => {
  return errors[fieldName];
};

// Clear specific field error
export const clearFieldError = (
  fieldName: string,
  errors: ValidationErrors
): ValidationErrors => {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
};

// Convert form data to proper types for validation
export const prepareFormDataForValidation = (formData: any) => {
  return {
    ...formData,
    tahun: parseInt(formData.tahun) || new Date().getFullYear(),
    kilometer: parseInt(formData.kilometer) || 0,
    harga_beli: parseInt(formData.harga_beli) || 0,
    harga_jual: parseInt(formData.harga_jual) || 0,
    previous_owners: parseInt(formData.previous_owners) || 1,
  };
};