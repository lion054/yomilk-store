import { Product, UoM } from './product';

export interface CartItem {
  itemCode: string;
  itemName: string;
  itemsGroupCode: number;
  salesVATGroup: string;
  salesVATRate: number;
  warehouseCode: string;
  quantity: number;
  price?: number;
  name?: string;
  image?: string;
  id?: string;
  uom: UoM;
  product: Product; // Full product data for display
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}
