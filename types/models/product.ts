// Product types based on Angular interfaces and API responses

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
  // API uses PascalCase
  ItemCode: string;
  ItemName: string;
  ItmsGrpCod: number;
  ItemsGroupName?: string;
  VatGourpSa: string;
  VatRate: number;
  DfltWH: string;
  UnitsOnStock?: number;
  PicturName?: string;

  // Normalized lowercase versions (for internal use)
  itemCode?: string;
  itemName?: string;
  id?: string;
  title?: string;

  // Additional fields
  defaultSalesUoMEntry?: number | null;
  defaultSalesUoMName?: string | null;
  price: number;
  currency: string;
  salesVATGroup?: string;
  salesVATRate?: number;
  warehouseCode?: string;
  storeUnitPrice?: number;
  uoMs?: UoM[];

  // Custom fields
  u_ONA_SubGroups?: any;
  u_ONA_Tags?: any;
  u_ONA_Upsells?: any;
  u_ONA_CrossSells?: any;
  u_ONA_Description?: string;

  // Display fields
  pictures?: string[];
  image?: string;
  images?: Array<{ img?: string }>;
  review?: number;
  ratingScore?: number;
  desc?: string;
  description?: string;
  stock?: number;
  unitsOnStock?: number;
  weight?: string | number;
  slug?: string;
  oldPrice?: number | null;
  name?: string;
  brand?: string;
  itemsGroupName?: string;
  gallery?: any[];
  discount?: { isActive: boolean; percentage: number };
  variations?: any[];
}

export interface ProductListResponse {
  values: Product[];
  recordCount: number;
  pageCount: number;
  pageNumber: number;
}

export interface Category {
  ItmsGrpCod: number;
  ItmsGrpNam: string;
  GroupName?: string;
}

export interface CategoryListResponse {
  values: Category[];
  recordCount: number;
  pageCount: number;
  pageNumber: number;
}
