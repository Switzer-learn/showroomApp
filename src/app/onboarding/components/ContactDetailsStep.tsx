'use client';

import { useState } from 'react';
import { ContactDetailsData, contactDetailsSchema } from '@/types/onboarding';
import { z } from 'zod';

interface ContactDetailsStepProps {
  onNext: (data: ContactDetailsData) => void;
  onBack: () => void;
  defaultValues?: Partial<ContactDetailsData>;
}

export function ContactDetailsStep({ onNext, onBack, defaultValues }: ContactDetailsStepProps) {
  const [formData, setFormData] = useState<Partial<ContactDetailsData>>({
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
      const validatedData = contactDetailsSchema.parse(formData);
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
        <h2 className="card-title">Contact Details</h2>
        <p className="text-base-content/70">
          Please provide your contact information
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">First Name *</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className={`input input-bordered ${errors.firstName ? 'input-error' : ''}`}
              />
              {errors.firstName && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.firstName}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Name *</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleInputChange}
                placeholder="Enter last name"
                className={`input input-bordered ${errors.lastName ? 'input-error' : ''}`}
              />
              {errors.lastName && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.lastName}</span>
                </label>
              )}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email Address *</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.email}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Phone Number *</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              placeholder="+62 8xx-xxxx-xxxx"
              className={`input input-bordered ${errors.phone ? 'input-error' : ''}`}
            />
            {errors.phone && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.phone}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Address *</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              placeholder="Enter business address"
              className={`input input-bordered ${errors.address ? 'input-error' : ''}`}
            />
            {errors.address && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.address}</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">City *</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                placeholder="Enter city"
                className={`input input-bordered ${errors.city ? 'input-error' : ''}`}
              />
              {errors.city && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.city}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Province *</span>
              </label>
              <input
                type="text"
                name="province"
                value={formData.province || ''}
                onChange={handleInputChange}
                placeholder="Enter province"
                className={`input input-bordered ${errors.province ? 'input-error' : ''}`}
              />
              {errors.province && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.province}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Postal Code *</span>
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode || ''}
                onChange={handleInputChange}
                placeholder="Enter postal code"
                className={`input input-bordered ${errors.postalCode ? 'input-error' : ''}`}
              />
              {errors.postalCode && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.postalCode}</span>
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={onBack} className="btn btn-ghost flex-1">
              Back
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Continue to Business Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}