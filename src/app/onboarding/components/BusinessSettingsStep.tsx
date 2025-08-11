'use client';

import React from 'react';
import { BusinessSettingsData } from '@/types/onboarding';

interface BusinessSettingsStepProps {
  formData: BusinessSettingsData;
  onChange: (data: BusinessSettingsData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BusinessSettingsStep({
  formData,
  onChange,
  onNext,
  onBack
}: BusinessSettingsStepProps) {
  const handleChange = (field: keyof BusinessSettingsData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const currencies = [
    { code: 'IDR', name: 'Indonesian Rupiah (Rp)' },
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'SGD', name: 'Singapore Dollar (S$)' },
  ];

  const timezones = [
    { value: 'Asia/Jakarta', label: 'WIB (Western Indonesia Time)' },
    { value: 'Asia/Makassar', label: 'WITA (Central Indonesia Time)' },
    { value: 'Asia/Jayapura', label: 'WIT (Eastern Indonesia Time)' },
  ];

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'en', name: 'English' },
  ];

  const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-base-content">Business Settings</h2>
        <p className="text-base-content/70 mt-2">
          Configure your business accounting and operational settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Currency Settings */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Currency</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={formData.currencyCode || 'IDR'}
            onChange={(e) => handleChange('currencyCode', e.target.value)}
            required
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Accounting Start Date */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Accounting Start Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={formData.accountingStartDate || ''}
            onChange={(e) => handleChange('accountingStartDate', e.target.value)}
            required
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              This will be the starting date for your accounting records
            </span>
          </label>
        </div>

        {/* Fiscal Year Start */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Fiscal Year Start (Optional)</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={formData.fiscalYearStart || ''}
            onChange={(e) => handleChange('fiscalYearStart', e.target.value)}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              When does your fiscal year begin? Leave blank to use calendar year
            </span>
          </label>
        </div>

        {/* Timezone */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Timezone</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={formData.timezone || 'Asia/Jakarta'}
            onChange={(e) => handleChange('timezone', e.target.value)}
            required
          >
            {timezones.map((timezone) => (
              <option key={timezone.value} value={timezone.value}>
                {timezone.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Language</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={formData.language || 'id'}
            onChange={(e) => handleChange('language', e.target.value)}
            required
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Format */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Date Format</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={formData.dateFormat || 'DD/MM/YYYY'}
            onChange={(e) => handleChange('dateFormat', e.target.value)}
            required
          >
            {dateFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
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
            Next Step
          </button>
        </div>
      </form>
    </div>
  );
}