// Re-export shared types to avoid duplication
export type { DocumentLine, OrderPayload } from './order';
export type { Address } from './user';

export type PaymentMethod = 'PayNow' | 'InnBucks' | 'Ecocash' | 'COD' | 'Pay on Account';

export interface PaymentResponse {
  success: boolean;
  redirectLink?: string;
  pollUrl?: string;
  code?: string;
  message?: string;
  docEntry?: number;
}

export interface InnBucksStatusResponse {
  status: string;
  transactionStatus: string;
  code: string;
}

export interface PaymentInvoice {
  docEntry: number;
  amount: number;
}

export interface IncomingPaymentPayload {
  cardCode: string;
  docDate: string;
  cashSum?: number;
  transferSum?: number;
  paymentMethod: PaymentMethod;
  paymentInvoices?: PaymentInvoice[];
  remarks?: string;
  paymentReference?: string;
  paymentPhoneNumber?: string;
  paymentFullName?: string;
  returnUrl?: string;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  billingAddress: string;
  billingCity: string;
  billingCountry?: string;
  billingSuburb?: string;
  useShippingAddress: boolean;
  shippingAddress?: string;
  shippingCity?: string;
  shippingCountry?: string;
  shippingSuburb?: string;
  paymentMethod: PaymentMethod;
  paymentPhoneNumber?: string;
  paymentReference?: string;
  deliveryInstructions?: string;
  deliveryType?: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
}
