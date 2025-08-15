import React, { useEffect, useState } from 'react';
import { StepProps } from './types';
import { Mail, Phone, User } from 'lucide-react';

interface ContactStepProps extends StepProps {
  errors?: Record<string, string>;
}

const ContactStep: React.FC<ContactStepProps> = ({
  formData,
  onInputChange,
  errors = {},
}) => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use dynamic import to avoid TypeScript issues
        const { createClient } = await import('../../utils/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserEmail(user.email || '');
          // Save email to formData
          onInputChange('email', user.email || '');
          // Pre-fill nama from user metadata if available
          if (user.user_metadata?.full_name) {
            onInputChange('nama', user.user_metadata.full_name);
          } else if (user.user_metadata?.name) {
            onInputChange('nama', user.user_metadata.name);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [onInputChange]);

  const handleFieldChange = (field: string, value: any) => {
    onInputChange(field as any, value);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold text-gray-800">Contact Information</h2>
          <p className="text-sm text-gray-600">Loading your contact details...</p>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
          <div className="h-10 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-gray-800">Contact Information</h2>
        <p className="text-sm text-gray-600">Your personal contact details</p>
      </div>

      <div className="space-y-3">
        {/* Email - Read-only */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="email"
              value={userEmail}
              readOnly
              className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Nama - Editable */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Nama <span className='text-red-500'>*</span></label>
          <div className="relative">
            <User className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="text"
              value={formData.nama || ''}
              onChange={(e) => handleFieldChange('nama', e.target.value)}
              placeholder="Enter your full name"
              className={`w-full pl-7 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:border-transparent transition-all ${
                errors.nama ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
          </div>
          {errors.nama && (
            <p className="mt-1 text-xs text-red-600">{errors.nama}</p>
          )}
        </div>

        {/* Nomor HP - Editable */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Nomor HP <span className='text-red-500'>*</span></label>
          <div className="relative">
            <Phone className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
            <input
              type="tel"
              value={formData.no_hp || ''}
              onChange={(e) => handleFieldChange('no_hp', e.target.value)}
              placeholder="+62 812-3456-7890"
              className={`w-full pl-7 pr-3 py-2 text-sm border rounded-md focus:ring-1 focus:border-transparent transition-all ${
                errors.no_hp ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
          </div>
          {errors.no_hp && (
            <p className="mt-1 text-xs text-red-600">{errors.no_hp}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactStep;