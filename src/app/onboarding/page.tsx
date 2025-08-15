'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormData } from './components/types';
import ChoiceStep from './components/ChoiceStep';
import CompanyStep from './components/CompanyStep';
import ContactStep from './components/ContactStep';
import JoinStep from './components/JoinStep';
import SummaryStep from './components/SummaryStep';
import CompleteStep from './components/CompleteStep';
import ProgressBar from './components/ProgressBar';
import NavigationButtons from './components/NavigationButtons';
import { joinCompanyFlowSchema, companySchema, contactSchema } from './validation';
import { ZodError } from 'zod';
import { uploadCompanyLogo, validateImageFile } from '../utils/storage';
import axios from 'axios';

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [choice, setChoice] = useState<'create' | 'join' | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'uploading' | 'creating' | null>(null);
  const [formData, setFormData] = useState<FormData>({
    // Company Setup & Details
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyLogo: null,
    website: '',
    slug: '',

    // Contact Details
    nama: '',
    email: '',
    no_hp: '',

    // Optional Branding (set by admin)
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',

    // Join Company
    companyId: '',
  });

  const router = useRouter();

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setStepErrors({}); // Clear previous errors
    // Autogenerate slug if on company step and choice is 'create'
    if (choice === 'create' && currentStep === 1) {
      const name = formData.companyName.trim();
      if (name) {
        // Simple slugify: lowercase, replace spaces and non-alphanum with '-'
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        setFormData(prev => ({ ...prev, slug }));
      }
    }
    if (validateCurrentStep()) {
      if (currentStep < getSteps().length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleChoiceSelect = (selectedChoice: 'create' | 'join') => {
    setChoice(selectedChoice);
    setCurrentStep(1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      if (choice === 'create') {
        let logoUrl = formData.companyLogo;

        // If companyLogo is a File, upload it first
        if (formData.companyLogo instanceof File) {
          setLoadingStep('uploading');
          // Validate image file
          const validation = validateImageFile(formData.companyLogo);
          if (!validation.valid) {
            throw new Error(validation.error);
          }
          // Upload logo to Supabase Storage
          logoUrl = await uploadCompanyLogo(
            formData.companyLogo,
            formData.slug || formData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          );
        }

        // Format payload for API
        const payload = {
          name: formData.companyName,
          email: formData.companyEmail,
          phone_number: formData.companyPhone,
          address: formData.companyAddress,
          settings: {
            companyLogo: logoUrl || null,
            website: formData.website || null,
            slug: formData.slug || null,
            primaryColor: formData.primaryColor || '#3B82F6',
            secondaryColor: formData.secondaryColor || '#6B7280',
          },
          // Contact details for user update
          nama: formData.nama,
          no_hp: formData.no_hp,
          user_email: formData.email,
        };

        setLoadingStep('creating');
        console.log('Creating company with data:', payload);

        // Use axios for API request
        const response = await axios.post('/api/onboarding/create-company', payload);

        const result = response.data;
        console.log('API response:', response);

        if (response.status !== 200) {
          throw new Error(result.error || 'Failed to create company');
        }

        console.log('Company created successfully:', result);

        // Only navigate to dashboard after successful creation
        router.push('/dashboard');
      } else if (choice === 'join') {
        setLoadingStep('creating');
        // Use axios for join company flow
        const response = await axios.post('/api/onboarding/join-company', {
          companyId: formData.companyId
        });
        const result = response.data;
        if (response.status !== 200) {
          throw new Error(result.error || 'Failed to join company');
        }
        console.log('Joined company successfully:', result);
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      alert(error?.response?.data?.error || error.message || 'An error occurred during onboarding');
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  };

  const getSteps = () => {
    if (choice === 'create') {
      return [
        { id: 'choice', title: 'Get Started', icon: '🚀' },
        { id: 'company', title: 'Company Info', icon: '🏢' },
        { id: 'contact', title: 'Contact Details', icon: '👤' },
        { id: 'summary', title: 'Summary', icon: '📋' },
        { id: 'complete', title: 'Complete', icon: '✅' },
      ];
    } else if (choice === 'join') {
      return [
        { id: 'choice', title: 'Get Started', icon: '🚀' },
        { id: 'join', title: 'Join Company', icon: '🔗' },
        { id: 'summary', title: 'Summary', icon: '📋' },
        { id: 'complete', title: 'Complete', icon: '✅' },
      ];
    }
    return [];
  };

  const getCurrentStepData = () => {
    const steps = getSteps();
    return steps[currentStep] || null;
  };

  const validateCurrentStep = () => {
    try {
      if (choice === 'create') {
        switch (currentStep) {
          case 1: // Company
            const companyData = {
              companyName: formData.companyName,
              companyPhone: formData.companyPhone,
              companyEmail: formData.companyEmail,
              companyAddress: formData.companyAddress,
              companyLogo: formData.companyLogo
            };
            companySchema.parse(companyData);
            return true;
          case 2: // Contact
            contactSchema.parse(formData);
            return true;
          default:
            return true;
        }
      } else if (choice === 'join') {
        if (currentStep === 1) {
          joinCompanyFlowSchema.parse(formData);
          return true;
        }
      }
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path[0].toString()] = issue.message;
          }
        });
        setStepErrors(errors);
      }
      console.error('Validation error:', error);
      return false;
    }
  };

  const renderStep = () => {
    if (choice === null) {
      return <ChoiceStep onChoiceSelect={handleChoiceSelect} />;
    }

    switch (currentStep) {
      case 0:
        return <ChoiceStep onChoiceSelect={handleChoiceSelect} />;
      case 1:
        if (choice === 'create') {
          return <CompanyStep formData={formData} onInputChange={handleInputChange} errors={stepErrors} />;
        } else {
          return <JoinStep formData={formData} onInputChange={handleInputChange} errors={stepErrors} />;
        }
      case 2:
        if (choice === 'create') {
          return <ContactStep formData={formData} onInputChange={handleInputChange} errors={stepErrors} />;
        } else {
          return <SummaryStep formData={formData} onEditStep={setCurrentStep} onConfirm={() => setCurrentStep(3)} />;
        }
      case 3:
        if (choice === 'create') {
          // Show loading after SummaryStep confirm, before CompleteStep
          if (loading) {
            return (
              <div className="text-center space-y-6 py-12">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {loadingStep === 'uploading' ? 'Uploading Company Logo...' : 
                     loadingStep === 'creating' ? 'Creating Your Company...' : 
                     'Processing...'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {loadingStep === 'uploading' ? 'Please wait while we upload your logo to secure storage.' :
                     loadingStep === 'creating' ? 'Setting up your company profile and workspace.' :
                     'This may take a few moments.'}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                       style={{ width: loadingStep === 'uploading' ? '50%' : '100%' }}></div>
                </div>
              </div>
            );
          }
          return <SummaryStep formData={formData} onEditStep={setCurrentStep} onConfirm={handleComplete} />;
        } else {
          return <CompleteStep onComplete={handleComplete} />;
        }
      case 4:
        return <CompleteStep onComplete={handleComplete} />;
      default:
        return <ChoiceStep onChoiceSelect={handleChoiceSelect} />;
    }
  };

  const steps = getSteps();
  const currentStepData = getCurrentStepData();
  const isChoiceStep = currentStep === 0;
  const isSummaryStep = currentStepData?.id === 'summary';
  const isCompleteStep = currentStepData?.id === 'complete';
  const shouldShowNavigation = !isChoiceStep && !isSummaryStep && !isCompleteStep && !loading;

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="">
            {renderStep()}
          </div>

          {shouldShowNavigation && (
            <div className="">
              <ProgressBar
                steps={steps.slice(1)}
                currentStep={currentStep - 1}
              />
              <div className="mt-4">
                <NavigationButtons
                  onNext={handleNext}
                  onBack={handleBack}
                  isFirstStep={currentStep === 1}
                  isLastStep={currentStep === steps.length - 1}
                  isNextDisabled={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}