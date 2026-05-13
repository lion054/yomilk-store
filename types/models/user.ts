// User and authentication types based on backend SessionModel

export interface CompanySettings {
  localCurrency: string;
  systemCurrency: string;
  isDirectRate: boolean;
  country?: string;
}

export interface Customer {
  cardCode: string;
  cardName: string;
  currency: string;
  warehouse: string;
  isVisitor: boolean;
  isInstantDelivery?: boolean;
  emailVerified?: boolean;
  warehouseName: string;
  emailAddress?: string;
  phone1?: string;
  addresses?: Address[];
  // Account balance/debt fields (from ERP)
  balance?: number;
  currentAccountBalance?: number;
  Balance?: number;
  CurrentAccountBalance?: number;
  creditLimit?: number;
  CreditLimit?: number;
}

export interface Address {
  addressName: string;
  street: string;
  city: string;
  country: string;
  state?: string;
}

export interface ExternalUser {
  userCode: string;
  fullName: string;
}

export interface UserSession {
  userCode: string;
  userName: string;
  userId: number;
  employeeId: number;
  jobTitle: string;
  salesPersonCode: number;
  token: string;
  tokenExpiry: string;
  databaseName: string;
  branchId?: number;
  warehouseCode: string;
  roles: string[];
  posRoles?: string[] | null;
  companyName: string;
  warehouseName?: string | null;
  companySettings?: CompanySettings;
  customer?: Customer;
  externalUser?: ExternalUser;
  branches?: Array<{ code: number; name: string }>;
}

export interface BusinessPartner {
  code?: string;
  Code?: string;
  lineId?: number;
  u_CardCode?: string;
  u_CardName?: string;
  u_CardType?: string;
  u_NeedOfferTransport?: string;
  // PascalCase variants from Auths/Users/BusinessPartners endpoint
  U_CardCode?: string;
  U_CardName?: string;
  U_CardType?: number;
  U_NeedOfferTransport?: number;
}

export interface Warehouse {
  WarehouseCode: string;
  WarehouseName: string;
  Street?: string;
  StreetNo?: string;
  BuildingFloorRoom?: string;
  City?: string;
  County?: string;
  State?: string;
  Country?: string;
  ZipCode?: string;
  U_ONA_IsStoreWarehouse?: string;
  U_ONA_InstantDeliveryWarehouse?: string;
  U_ONA_IsMainWarehouse?: string;
  U_ONA_HasFuel?: string;
  U_ONA_HasConsumables?: string;
  U_ONA_IsBonded?: string;
  U_ONA_POSAddress?: string;
  U_ONA_POSShopName?: string;
  U_ONA_POSStockFromWhs?: string;
  U_ONA_Latitude?: string;
  U_ONA_Longitude?: string;
}

export interface LoginPayload {
  companyDB: string;
  username: string;
  password: string;
  auth?: string; // CAPTCHA token if needed
}

export interface RegisterAddress {
  addressLine1: string;
  suburb: string;
  city: string;
  countryCode: string;
  countryName: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  phoneNumber: string;
  whatsAppNumber?: string;
  isCompany: boolean;
  tin?: string;
  vatNumber?: string;
  password: string;
  confirmPassword: string;
  verificationUrl: string;
  isSeparateShipping: boolean;
  billToAddress: RegisterAddress;
  shipToAddress: RegisterAddress;
  notes?: string;
}

export interface ForgotPasswordPayload {
  emailAddress: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}
