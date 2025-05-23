import { loadStripe } from '@stripe/stripe-js';
import { apiService } from '../api';
import { API_ENDPOINTS } from '../api/config';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PurchaseCreditsResponse {
  clientSecret: string;
}

interface CheckoutSession {
  url: string;
}

export const paymentService = {
  purchaseCredits: async (amount: number): Promise<void> => {
    const response = await apiService.post<PurchaseCreditsResponse>(API_ENDPOINTS.USERS.CREDITS.PURCHASE, {
      amount,
    });

    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to initialize');

    const { error } = await stripe.confirmCardPayment(response.data.clientSecret);
    if (error) throw error;
  },

  getCredits: async (): Promise<number> => {
    const response = await apiService.get<number>(API_ENDPOINTS.USERS.CREDITS.GET);
    return response.data;
  },

  createCheckoutSession: async (credits: number): Promise<CheckoutSession> => {
    const response = await apiService.post(API_ENDPOINTS.PAYMENTS.CREATE_CHECKOUT, {
      credits,
    });
    return response.data;
  },

  verifyPayment: async (sessionId: string): Promise<void> => {
    await apiService.post(API_ENDPOINTS.PAYMENTS.VERIFY, {
      session_id: sessionId
    });
  }
};