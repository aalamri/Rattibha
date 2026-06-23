import type { CategoryKey, CityKey } from '@/data/categories';

export interface OnboardingForm {
  businessName: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  city: CityKey;
  teamSize: string;
  yearsInBusiness: string;
  bio: string;
  categories: CategoryKey[];
  budgetTier: string;
  startingPrice: string;
  crNumber: string;
  agreedToTerms: boolean;
  portfolioFiles: File[];
}

export const MAX_PORTFOLIO_PHOTOS = 8;

export const INITIAL_FORM: OnboardingForm = {
  businessName: '',
  fullName: '',
  phone: '',
  email: '',
  password: '',
  city: 'riyadh',
  teamSize: '',
  yearsInBusiness: '',
  bio: '',
  categories: [],
  budgetTier: '',
  startingPrice: '',
  crNumber: '',
  agreedToTerms: false,
  portfolioFiles: [],
};
