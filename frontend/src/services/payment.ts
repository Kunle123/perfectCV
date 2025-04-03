import { loadStripe } from '@stripe/stripe-js';
import api from '../utils/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PurchaseCreditsResponse {
  clientSecret: string;
}

interface CheckoutSession {
  url: string;
}

export const purchaseCredits = async (amount: number): Promise<void> => {
  const response = await api.post<PurchaseCreditsResponse>('/api/v1/users/credits/purchase', {
    amount,
  });

  const stripe = await stripePromise;
  if (!stripe) throw new Error('Stripe failed to initialize');

  const { error } = await stripe.confirmCardPayment(response.data.clientSecret);
  if (error) throw error;
};

export const getCredits = async (): Promise<number> => {
  const response = await api.get<number>('/api/v1/users/credits');
  return response.data;
};

export const createCheckoutSession = async (credits: number): Promise<CheckoutSession> => {
  const response = await api.post('/api/v1/payments/create-checkout-session', {
    credits,
  });
  return response.data;
};
