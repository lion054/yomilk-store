import { CartItem } from '../models/cart';
import { Product, UoM } from '../models/product';

export interface CartContextValue {
  cart: CartItem[];
  cartTotal: number;
  cartItemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, uom: UoM) => void;
  removeFromCart: (index: number) => void;
  increaseQuantity: (index: number) => void;
  decreaseQuantity: (index: number) => void;
  incrementItem: (index: number) => void;
  decrementItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  switchCartUser: (cardCode?: string) => void;
}
