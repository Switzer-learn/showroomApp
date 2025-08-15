import React from 'react';
import { StepProps } from './types';
import { Users } from 'lucide-react';

const JoinStep: React.FC<StepProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-800">Join Your Company</h2>
        <p className="text-sm text-gray-600">Enter your company ID to send a join request</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Company ID</label>
          <input
            type="text"
            value={formData.companyId}
            onChange={(e) => onInputChange('companyId', e.target.value)}
            placeholder="Enter company ID (e.g., COMP-12345)"
            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
          <p className="text-xs text-gray-500">Ask your admin for the company ID</p>
        </div>

        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-3 h-3 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 text-sm">Pending Approval</h4>
              <p className="text-xs text-blue-700 mt-1">
                After submitting, your request will be sent to the company admin for approval.
                You'll receive an email notification once approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinStep;