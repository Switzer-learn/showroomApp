import React from 'react';
import { motion } from 'framer-motion';
import { Building, Users, ChevronRight } from 'lucide-react';
import { ChoiceStepProps } from './types';

const ChoiceStep: React.FC<ChoiceStepProps> = ({ onChoiceSelect }) => {
  return (
    <div className="text-center space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Welcome to Showroom Mobil Bekas
        </h2>
        <p className="text-sm text-gray-600 max-w-sm mx-auto">
          Let's get you started with your automotive business management system
        </p>
      </div>
      
      <div className="grid gap-4 max-w-md mx-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChoiceSelect('create')}
          className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-md group-hover:bg-blue-200 transition-colors">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-base text-gray-800">Set Up New Company</h3>
              <p className="text-xs text-gray-600">Create a new business account and get started</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChoiceSelect('join')}
          className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-md group-hover:bg-blue-200 transition-colors">
              <Users className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-base text-gray-800">Join Existing Company</h3>
              <p className="text-xs text-gray-600">Join your team with a company invitation</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default ChoiceStep;