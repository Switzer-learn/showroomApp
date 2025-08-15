import { createClient } from './supabase/client';

export async function uploadCompanyLogo(file: File, companySlug: string): Promise<string> {
  const supabase = createClient();
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `private/${companySlug}-${Date.now()}.${fileExt}`;

  
  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from('company_logos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading logo:', error);
    throw new Error(`Failed to upload logo: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('company_logos')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be smaller than 5MB' };
  }

  return { valid: true };
}
