import React from 'react';
import { StepProps } from './types';
import { currencies, timezones } from './constants';
import { Calendar, Clock, DollarSign, Globe } from 'lucide-react';

const BusinessStep: React.FC<StepProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-gray-800">Business Settings</h2>
        <p className="text-sm text-gray-600">Configure your business preferences</p>
      </div>

      <div className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
              Default Currency
            </label>
            <select
              value={formData.currencyCode}
              onChange={(e) => onInputChange('currencyCode', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <Globe className="w-3 h-3 mr-1 text-gray-400" />
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => onInputChange('timezone', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            >
              {timezones.map((timezone) => (
                <option key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
              Accounting Start Date
            </label>
            <input
              type="date"
              value={formData.accountingStartDate}
              onChange={(e) => onInputChange('accountingStartDate', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700 flex items-center">
              <Clock className="w-3 h-3 mr-1 text-gray-400" />
              Fiscal Year Start
            </label>
            <select
              value={formData.fiscalYearStart}
              onChange={(e) => onInputChange('fiscalYearStart', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            >
              <option value="january">January</option>
              <option value="february">February</option>
              <option value="march">March</option>
              <option value="april">April</option>
              <option value="may">May</option>
              <option value="june">June</option>
              <option value="july">July</option>
              <option value="august">August</option>
              <option value="september">September</option>
              <option value="october">October</option>
              <option value="november">November</option>
              <option value="december">December</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-800">Business Features</h3>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enableMultiBranch}
                onChange={(e) => onInputChange('enableMultiBranch', e.target.checked)}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-700">Enable Multi-Branch Management</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enableWorkshopModule}
                onChange={(e) => onInputChange('enableWorkshopModule', e.target.checked)}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-700">Enable Workshop Module</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enableAccountingModule}
                onChange={(e) => onInputChange('enableAccountingModule', e.target.checked)}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-xs text-gray-700">Enable Accounting Module</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessStep;