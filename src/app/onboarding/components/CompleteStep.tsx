import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface CompleteStepProps {
  onComplete: () => void;
}

const CompleteStep: React.FC<CompleteStepProps> = ({ onComplete }) => {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-gray-800">Setup Complete!</h2>
        <p className="text-sm text-gray-600">
          Your workspace is ready. Let's get started with your business.
        </p>
      </div>

      <button
        onClick={onComplete}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
        <ArrowRight className="ml-2 w-3 h-3" />
      </button>
    </div>
  );
};

export default CompleteStep;