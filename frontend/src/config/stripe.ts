import { loadStripe } from '@stripe/stripe-js';

export const STRIPE_PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
