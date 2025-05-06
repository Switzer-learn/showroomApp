import { createClientWithCookies } from "@/app/lib/dbFunction";
export async function handleSignOut() {
  const supabase = await createClientWithCookies();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    return false;
  }
  
}

// /app/utils/formatters.js

/**
 * Format a number as Indonesian Rupiah currency
 * @param {number} price - The price to format
 * @returns {string} - Formatted price string
 */
export function formatPrice(price:number) {
  if (!price && price !== 0) return '-';
  
  return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
  }).format(price);
}

/**
* Format a number with thousand separators
* @param {number} value - The value to format
* @returns {string} - Formatted number string
*/
export function formatNumber(value:number) {
  if (!value && value !== 0) return '-';
  
  return new Intl.NumberFormat('id-ID').format(value);
}

/**
* Format a date string to localized date format
* @param {string} dateString - ISO date string
* @returns {string} - Formatted date string
*/
export function formatDate(dateString:string) {
  if (!dateString) return '-';
  
  return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
  });
}

