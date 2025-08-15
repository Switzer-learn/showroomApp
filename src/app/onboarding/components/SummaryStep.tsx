'use client';

import React from 'react';
import { FormData } from './types';
import { Edit3 } from 'lucide-react';

interface SummaryStepProps {
  formData: FormData;
  onEditStep: (stepIndex: number) => void;
  onConfirm: () => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ formData, onEditStep, onConfirm }) => {
  const sections = [
    {
      title: 'Company Information',
      stepIndex: 1,
      fields: [
        { label: 'Company Name', value: formData.companyName },
        { label: 'Company Address', value: formData.companyAddress },
        { label: 'Company Phone', value: formData.companyPhone },
        { label: 'Company Email', value: formData.companyEmail },
        { label: 'Website', value: formData.website },
        { label: 'Slug', value: formData.slug },
        { label: 'Company Logo', value: formData.companyLogo ? (typeof formData.companyLogo === 'string' ? formData.companyLogo : 'File uploaded') : '-' },
      ]
    },
    {
      title: 'Contact Details',
      stepIndex: 2,
      fields: [
        { label: 'Full Name', value: formData.nama },
        { label: 'Email', value: formData.email, readOnly: true },
        { label: 'Phone Number', value: formData.no_hp },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-800">Review Your Information</h2>
        <p className="text-sm text-gray-600">
          Please review all the information below. You can edit any field except email.
        </p>
      </div>

      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-gray-800">{section.title}</h3>
            <button
              onClick={() => onEditStep(section.stepIndex)}
              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Edit
            </button>
          </div>

          <div className="space-y-2">
            {section.fields.map((field, fieldIndex) => (
              <div key={fieldIndex} className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-600">{field.label}:</span>
                <span className={`text-xs font-medium ${field.readOnly ? 'text-gray-500' : 'text-gray-800'}`}>
                  {field.value || '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-between pt-4">
        <button
          onClick={() => onEditStep(2)} // Go back to contact step
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Edit
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
};

export default SummaryStep;