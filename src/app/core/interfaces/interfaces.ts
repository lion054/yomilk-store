export interface Location {
  latitude: number;
  longitude: number;
}

export interface Suburb {
  name: string;
  location: Location | null;
}

export interface City {
  name: string;
  location: Location | null;
  suburbs: Suburb[];
}

export interface Country {
  countryCode: string;
  countryName: string;
  location: Location | null;
  cities: City[];
}

export interface UoM {
  uomEntry: number;
  uomName: string;
  price: number;
  inStock: number;
  inventoryQuantityFactor: number;
  currency: string;
  isPricingUOM: boolean;
  isInventoryOM: boolean;
  uomQuantity: number;
}

export interface Product {
  itemCode: string;
  itemName: string;
  image: string;
  pictures: string[];
  defaultSalesUoMEntry: number | null;
  defaultSalesUoMName: string | null;
  price: number;
  currency: string;
  salesVATGroup: string;
  salesVATRate: number;
  warehouseCode: string;
  unitsOnStock: number;
  storeUnitPrice: number;
  itemsGroupCode: number | any;
  uoMs: UoM[];
  itemUnitOfMeasurementCollection: any | any;
  u_ONA_SubGroups: any
  u_ONA_Tags: any,
  u_ONA_Upsells: any,
  u_ONA_CrossSells: any,
  u_ONA_Description: any,
}

// Wishlist
export interface WishlistItem {
  itemCode: string;
  itemName: string;
  image: string;
  price: number;
  currency: string;
  addedAt: Date;
  uom?: UoM;
}

// Leaflets & Publications
export interface Leaflet {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  pdfUrl: string;
  validFrom: Date;
  validUntil: Date;
  shopId?: string;
  category: 'weekly-specials' | 'seasonal' | 'promotions' | 'catalogue';
  isActive: boolean;
}

// Multi-Shop Support
export interface Shop {
  id: string;
  code: string;
  name: string;
  logo: string;
  description: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  operatingHours: OperatingHours[];
  deliveryAreas: DeliveryArea[];
  isActive: boolean;
  rating?: number;
  badge?: 'featured' | 'verified' | 'new';
  categories?: string[];
}

export interface OperatingHours {
  day: string;
  open: string;
  close: string;
}

export interface DeliveryArea {
  name: string;
  fee: number;
  minOrder: number;
  estimatedTime?: string;
}
