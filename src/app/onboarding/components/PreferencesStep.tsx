import React from 'react';
import { StepProps } from './types';
import { colorPresets } from './constants';
import { Palette } from 'lucide-react';

const PreferencesStep: React.FC<StepProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-gray-800">Appearance Preferences</h2>
        <p className="text-sm text-gray-600">Customize your workspace appearance</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-800 mb-2">Color Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onInputChange('primaryColor', preset.primary);
                  onInputChange('secondaryColor', preset.secondary);
                }}
                className={`p-2 rounded-md border transition-all ${
                  formData.primaryColor === preset.primary
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                </div>
                <p className="text-xs font-medium text-gray-700 mt-1">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-800 mb-2">Custom Colors</h3>
          <div className="grid md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 flex items-center">
                <Palette className="w-3 h-3 mr-1 text-gray-400" />
                Primary Color
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => onInputChange('primaryColor', e.target.value)}
                  className="h-6 w-12 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => onInputChange('primaryColor', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 flex items-center">
                <Palette className="w-3 h-3 mr-1 text-gray-400" />
                Secondary Color
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => onInputChange('secondaryColor', e.target.value)}
                  className="h-6 w-12 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => onInputChange('secondaryColor', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-xs"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesStep;