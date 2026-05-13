/**
 * Common TypeScript types and interfaces used throughout the app
 */

import { ReactNode } from 'react';

// ============================================================================
// REACT COMPONENT TYPES
// ============================================================================

export interface ComponentProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

// ============================================================================
// COMMON CALLBACK TYPES
// ============================================================================

export type OnChange = (value: any) => void;
export type OnClick = (e: React.MouseEvent<HTMLElement>) => void;
export type OnSubmit = (e: React.FormEvent<HTMLFormElement>) => void;
export type OnError = (error: Error | string) => void;
export type OnSuccess = (data?: any) => void;

// ============================================================================
// PRODUCT TYPES — canonical definition is in types/models/product.ts
// ============================================================================
import type { Product, UoM as UnitOfMeasure } from './models/product';
export type { Product, UnitOfMeasure };

// ============================================================================
// CART TYPES
// ============================================================================

export interface CartItem {
  itemCode: string;
  itemName: string;
  quantity: number;
  uom: UnitOfMeasure;
  price?: number;
  product?: Product;
  vendor?: string;
  image?: string;
  salesVATRate?: number;
  [key: string]: any;
}

export interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}

// ============================================================================
// USER/AUTH TYPES
// ============================================================================

export interface UserAddress {
  addressLine1: string;
  suburb?: string;
  city: string;
  countryCode?: string;
  countryName?: string;
}

export interface Customer {
  cardCode: string;
  cardName?: string;
  isVisitor?: boolean;
  isInstantDelivery?: boolean;
  warehouse?: string;
  emailVerified?: boolean;
  addresses?: UserAddress[];
}

export interface UserSession {
  userCode: string;
  userName?: string;
  token: string;
  tokenExpiry?: string;
  customer?: Customer;
  roles?: string[];
  companySettings?: any;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PaymentMethod {
  code: string;
  name: string;
  type: 'bank' | 'mobile' | 'wallet';
}

export interface PaymentRequest {
  amount: number;
  invoiceId: string;
  method: string;
  phoneNumber?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  values?: T[];
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  skip?: number;
  take?: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface Filter {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  vendor?: string;
  inStock?: boolean;
  [key: string]: any;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Async<T> = Promise<T>;

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
  data?: any;
}
