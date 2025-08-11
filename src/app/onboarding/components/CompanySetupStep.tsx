'use client';

import { useState } from 'react';
import { CompanySetupData, companySetupSchema } from '@/types/onboarding';
import { z } from 'zod';

interface CompanySetupStepProps {
  onNext: (data: CompanySetupData) => void;
  defaultValues?: Partial<CompanySetupData>;
}

export function CompanySetupStep({ onNext, defaultValues }: CompanySetupStepProps) {
  const [formData, setFormData] = useState<Partial<CompanySetupData>>({
    businessType: 'dealer',
    ...defaultValues,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = companySetupSchema.parse(formData);
      onNext(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="card w-full max-w-2xl mx-auto bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Company Setup</h2>
        <p className="text-base-content/70">
          Let's start by setting up your company information
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Company Name *</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName || ''}
              onChange={handleInputChange}
              placeholder="Enter your company name"
              className={`input input-bordered ${errors.companyName ? 'input-error' : ''}`}
            />
            {errors.companyName && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.companyName}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Business Type *</span>
            </label>
            <select
              name="businessType"
              value={formData.businessType || 'dealer'}
              onChange={handleInputChange}
              className={`select select-bordered ${errors.businessType ? 'select-error' : ''}`}
            >
              <option value="dealer">Car Dealer</option>
              <option value="showroom">Car Showroom</option>
              <option value="workshop">Car Workshop</option>
              <option value="other">Other</option>
            </select>
            {errors.businessType && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.businessType}</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tax ID (NPWP)</span>
              </label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId || ''}
                onChange={handleInputChange}
                placeholder="Enter your tax ID"
                className={`input input-bordered ${errors.taxId ? 'input-error' : ''}`}
              />
              {errors.taxId && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.taxId}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Website URL</span>
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl || ''}
                onChange={handleInputChange}
                placeholder="https://yourcompany.com"
                className={`input input-bordered ${errors.websiteUrl ? 'input-error' : ''}`}
              />
              {errors.websiteUrl && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.websiteUrl}</span>
                </label>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Continue to Contact Details
          </button>
        </form>
      </div>
    </div>
  );
}