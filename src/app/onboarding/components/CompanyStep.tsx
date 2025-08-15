import React, { useState } from 'react';
import { StepProps } from './types';

interface CompanyStepProps extends StepProps {
  errors?: Record<string, string>;
}

const CompanyStep: React.FC<CompanyStepProps> = ({
  formData,
  onInputChange,
  errors = {},
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      onInputChange('companyLogo', file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    onInputChange('companyLogo', null);
  };

  const handleFieldChange = (field: string, value: any) => {
    onInputChange(field as any, value);
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-gray-800">Company Information</h2>
        <p className="text-sm text-gray-600">Tell us about your business</p>
      </div>
      {/* Short fields in one row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Company Name <span className='text-red-500'>*</span></label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => handleFieldChange('companyName', e.target.value)}
            placeholder="Enter your company name"
            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:border-transparent transition-all ${
              errors.companyName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {errors.companyName && (
            <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Company Phone <span className='text-red-500'>*</span></label>
          <input
            type="tel"
            value={formData.companyPhone || ''}
            onChange={(e) => handleFieldChange('companyPhone', e.target.value)}
            placeholder="08 123 4567 8900"
            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:border-transparent transition-all ${
              errors.companyPhone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {errors.companyPhone && (
            <p className="mt-1 text-xs text-red-600">{errors.companyPhone}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Company Email <span className='text-red-500'>*</span></label>
          <input
            type="email"
            value={formData.companyEmail || ''}
            onChange={(e) => handleFieldChange('companyEmail', e.target.value)}
            placeholder="yourcompany@email.com"
            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:border-transparent transition-all ${
              errors.companyEmail ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
          />
          {errors.companyEmail && (
            <p className="mt-1 text-xs text-red-600">{errors.companyEmail}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleFieldChange('website', e.target.value)}
            placeholder="https://yourcompany.com"
            className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:border-transparent transition-all ${
              errors.website ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.website && (
            <p className="mt-1 text-xs text-red-600">{errors.website}</p>
          )}
        </div>
      </div>
      {/* Company Address full width */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">Company Address <span className='text-red-500'>*</span></label>
        <textarea
          value={formData.companyAddress || ''}
          onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
          placeholder="Enter your company address"
          rows={3}
          className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:border-transparent transition-all resize-none ${
            errors.companyAddress ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
          required
        />
        {errors.companyAddress && (
          <p className="mt-1 text-xs text-red-600">{errors.companyAddress}</p>
        )}
      </div>
      {/* Company Logo */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Company Logo</label>
        {logoPreview ? (
          <div className="space-y-2">
            <div className="relative inline-block">
              <img
                src={logoPreview}
                alt="Company logo preview"
                className="w-24 h-24 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-500">Click to change logo</p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block">
              <div className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 transition-colors">
                <svg
                  className="mx-auto h-8 w-8 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-xs text-gray-600">
                  Upload company logo (max 5MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyStep;