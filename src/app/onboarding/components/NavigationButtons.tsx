import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isNextDisabled?: boolean;
  nextLabel?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  isNextDisabled = false,
  nextLabel = 'Next',
}) => {
  return (
    <div className="flex justify-between mt-4">
      <button
        onClick={onBack}
        disabled={isFirstStep}
        className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium transition-colors ${
          isFirstStep
            ? 'hidden'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <ChevronLeft className="w-3 h-3 mr-1" />
        Back
      </button>

      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          isNextDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {nextLabel}
        {!isLastStep && <ChevronRight className="w-3 h-3 ml-1" />}
      </button>
    </div>
  );
};

export default NavigationButtons;