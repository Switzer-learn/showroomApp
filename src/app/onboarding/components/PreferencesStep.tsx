'use client';

import React from 'react';
import { PreferencesData } from '@/types/onboarding';

interface PreferencesStepProps {
  formData: PreferencesData;
  onChange: (data: PreferencesData) => void;
  onComplete: () => void;
  onBack: () => void;
}

export default function PreferencesStep({
  formData,
  onChange,
  onComplete,
  onBack
}: PreferencesStepProps) {
  const handleChange = (field: keyof PreferencesData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  const colorPresets = [
    { name: 'Blue', primary: '#3B82F6', secondary: '#1E40AF' },
    { name: 'Green', primary: '#10B981', secondary: '#047857' },
    { name: 'Purple', primary: '#8B5CF6', secondary: '#7C3AED' },
    { name: 'Red', primary: '#EF4444', secondary: '#DC2626' },
    { name: 'Orange', primary: '#F97316', secondary: '#EA580C' },
    { name: 'Teal', primary: '#14B8A6', secondary: '#0F766E' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-base-content">Preferences & Features</h2>
        <p className="text-base-content/70 mt-2">
          Customize your application features and appearance
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Feature Modules */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-base-content">Feature Modules</h3>
          
          <div className="space-y-3">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={formData.enableMultiBranch || false}
                onChange={(e) => handleChange('enableMultiBranch', e.target.checked)}
              />
              <span className="label-text">
                <span className="font-medium">Multi-Branch Support</span>
                <br />
                <span className="text-sm text-base-content/60">
                  Manage multiple dealership locations
                </span>
              </span>
            </label>

            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={formData.enableWorkshopModule || false}
                onChange={(e) => handleChange('enableWorkshopModule', e.target.checked)}
              />
              <span className="label-text">
                <span className="font-medium">Workshop Module</span>
                <br />
                <span className="text-sm text-base-content/60">
                  Service and repair management
                </span>
              </span>
            </label>

            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={formData.enableAccountingModule !== false}
                onChange={(e) => handleChange('enableAccountingModule', e.target.checked)}
              />
              <span className="label-text">
                <span className="font-medium">Accounting Module</span>
                <br />
                <span className="text-sm text-base-content/60">
                  Full accounting and financial management
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Color Theme */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-base-content">Color Theme</h3>
          
          <div className="grid grid-cols-3 gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className={`btn btn-outline h-auto py-3 px-4 ${
                  formData.primaryColor === preset.primary ? 'btn-primary' : ''
                }`}
                onClick={() => {
                  handleChange('primaryColor', preset.primary);
                  handleChange('secondaryColor', preset.secondary);
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-base-300" 
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-base-300" 
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-sm">{preset.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Color Picker */}
          <div className="space-y-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Primary Color</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="input input-bordered w-16 h-10"
                  value={formData.primaryColor || '#3B82F6'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                />
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  value={formData.primaryColor || '#3B82F6'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Secondary Color</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="input input-bordered w-16 h-10"
                  value={formData.secondaryColor || '#1E40AF'}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                />
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  value={formData.secondaryColor || '#1E40AF'}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  placeholder="#1E40AF"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-base-content">Preview</h3>
          <div className="bg-base-200 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: formData.primaryColor || '#3B82F6' }}
              >
                A
              </div>
              <div>
                <h4 className="font-semibold">Your Brand</h4>
                <p className="text-sm text-base-content/60">Primary color preview</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button 
                className="btn btn-sm"
                style={{ 
                  backgroundColor: formData.primaryColor || '#3B82F6',
                  borderColor: formData.primaryColor || '#3B82F6',
                  color: 'white'
                }}
              >
                Primary Button
              </button>
              <button 
                className="btn btn-sm btn-outline"
                style={{ 
                  borderColor: formData.secondaryColor || '#1E40AF',
                  color: formData.secondaryColor || '#1E40AF'
                }}
              >
                Secondary Button
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-ghost"
          >
            Back
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Complete Setup
          </button>
        </div>
      </form>
    </div>
  );
}