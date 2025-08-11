/**
 * Format a number as Indonesian Rupiah currency
 * @param price - The price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
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
 * @param value - The value to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  if (!value && value !== 0) return '-';
  
  return new Intl.NumberFormat('id-ID').format(value);
}

/**
 * Format a date string to localized date format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a date to a short format (DD/MM/YYYY)
 * @param date - Date object or string
 * @returns Formatted date string
 */
export function formatShortDate(date: Date | string): string {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('id-ID');
}