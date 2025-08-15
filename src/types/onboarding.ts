import { z } from 'zod';

export type CompanySetupData = {
  companyName: string;
  domain: string;
  industry: string;
  teamSize: string;
};

export type JoinCompanyData = {
  companyId: string;
  companyName: string;
};

export type OnboardingData = 
  | { type: 'new_company'; data: CompanySetupData }
  | { type: 'join_company'; data: JoinCompanyData };

export const companySetupSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  domain: z.string().min(1, 'Domain is required'),
  industry: z.string().min(1, 'Industry is required'),
  teamSize: z.string().min(1, 'Team size is required'),
});