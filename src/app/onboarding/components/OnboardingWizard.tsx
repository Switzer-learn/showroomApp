'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingData, OnboardingStep, OnboardingProgress } from '@/types/onboarding';
import { CompanySetupStep } from './CompanySetupStep';
import { ContactDetailsStep } from './ContactDetailsStep';
import BusinessSettingsStep from './BusinessSettingsStep';
import PreferencesStep from './PreferencesStep';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/lib/database.types';

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Company Setup',
    description: 'Set up your dealership company information',
    component: CompanySetupStep,
  },
  {
    id: 2,
    title: 'Contact Details',
    description: 'Add your business contact information',
    component: ContactDetailsStep,
  },
  {
    id: 3,
    title: 'Business Settings',
    description: 'Configure your accounting and business settings',
    component: BusinessSettingsStep,
  },
  {
    id: 4,
    title: 'Preferences',
    description: 'Customize features and appearance',
    component: PreferencesStep,
  },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const progress: OnboardingProgress = {
    currentStep: currentStep + 1,
    totalSteps: steps.length,
    completedSteps,
    isCompleted: currentStep === steps.length - 1,
  };

  const handleDataChange = (stepData: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setError(null);
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.companySetup?.companyName,
          business_type: formData.companySetup?.businessType,
          tax_id: formData.companySetup?.taxId,
          website_url: formData.companySetup?.websiteUrl,
          email: formData.contactDetails?.email,
          phone: formData.contactDetails?.phone,
          address: formData.contactDetails?.address,
          city: formData.contactDetails?.city,
          province: formData.contactDetails?.province,
          postal_code: formData.contactDetails?.postalCode,
          country: 'Indonesia',
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (companyError) {
        throw new Error(`Failed to create company: ${companyError.message}`);
      }

      // Create company settings
      const { error: settingsError } = await supabase
        .from('company_settings')
        .insert({
          company_id: company.id,
          currency_code: formData.businessSettings?.currencyCode || 'IDR',
          accounting_start_date: formData.businessSettings?.accountingStartDate,
          fiscal_year_start: formData.businessSettings?.fiscalYearStart,
          timezone: formData.businessSettings?.timezone || 'Asia/Jakarta',
          language: formData.businessSettings?.language || 'id',
          date_format: formData.businessSettings?.dateFormat || 'DD/MM/YYYY',
          enable_multi_branch: formData.preferences?.enableMultiBranch || false,
          enable_workshop_module: formData.preferences?.enableWorkshopModule || false,
          enable_accounting_module: formData.preferences?.enableAccountingModule !== false,
          primary_color: formData.preferences?.primaryColor || '#3B82F6',
          secondary_color: formData.preferences?.secondaryColor || '#1E40AF',
        });

      if (settingsError) {
        throw new Error(`Failed to create settings: ${settingsError.message}`);
      }

      // Update user with company_id and role
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          company_id: company.id,
          role: 'admin',
          first_name: formData.contactDetails?.firstName,
          last_name: formData.contactDetails?.lastName,
        })
        .eq('id', user.id);

      if (userUpdateError) {
        throw new Error(`Failed to update user: ${userUpdateError.message}`);
      }

      // Create onboarding progress record
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .insert({
          user_id: user.id,
          company_id: company.id,
          current_step: steps.length,
          completed_steps: steps.map((_, index) => index + 1),
          is_completed: true,
          completed_at: new Date().toISOString(),
        });

      if (progressError) {
        console.warn('Failed to create onboarding progress:', progressError);
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-base-content">Welcome to Showroom Mobil Bekas</h1>
            <span className="text-sm text-base-content/60">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="w-full bg-base-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-xs ${
                  index <= currentStep ? 'text-primary font-medium' : 'text-base-content/60'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6 md:p-8">
          {currentStep === 0 && (
            <CompanySetupStep
              onNext={(data) => {
                handleDataChange({ companySetup: data });
                handleNext();
              }}
            />
          )}
          {currentStep === 1 && (
            <ContactDetailsStep
              onNext={(data) => {
                handleDataChange({ contactDetails: data });
                handleNext();
              }}
              onBack={handleBack}
            />
          )}
          {currentStep === 2 && (
            <BusinessSettingsStep
              formData={{
                currencyCode: formData.businessSettings?.currencyCode || 'IDR',
                accountingStartDate: formData.businessSettings?.accountingStartDate || new Date().toISOString().split('T')[0],
                timezone: formData.businessSettings?.timezone || 'Asia/Jakarta',
                language: formData.businessSettings?.language || 'id',
                dateFormat: formData.businessSettings?.dateFormat || 'DD/MM/YYYY',
                fiscalYearStart: formData.businessSettings?.fiscalYearStart
              }}
              onChange={(data) => handleDataChange({ businessSettings: data })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <PreferencesStep
              formData={{
                enableMultiBranch: formData.preferences?.enableMultiBranch || false,
                enableWorkshopModule: formData.preferences?.enableWorkshopModule || false,
                enableAccountingModule: formData.preferences?.enableAccountingModule !== false,
                primaryColor: formData.preferences?.primaryColor || '#3B82F6',
                secondaryColor: formData.preferences?.secondaryColor || '#1E40AF'
              }}
              onChange={(data) => handleDataChange({ preferences: data })}
              onComplete={handleComplete}
              onBack={handleBack}
            />
          )}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 p-8 rounded-lg shadow-xl">
              <div className="flex items-center gap-4">
                <span className="loading loading-spinner loading-lg"></span>
                <span className="text-lg">Setting up your account...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}