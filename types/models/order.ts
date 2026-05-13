import { Address } from './user';

export interface DocumentLine {
  lineNum: number;
  itemCode: string;
  itemDescription: string;
  quantity: number;
  priceAfterVAT: number;
  warehouseCode: string;
  vatGroup: string;
  vatRate: number;
  uoMEntry: number;
  uoMCode: string;
}

export interface OrderPayload {
  docCurrency: string;
  comments: string;
  paymentReference: string;
  paymentMethod: string;
  documentLines: DocumentLine[];
  billToAddress: Address;
  shipToAddress?: Address | null;
  paymentPhoneNumber: string;
  paymentFullName: string;
  returnUrl: string;
  deliveryType: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
}

export interface Invoice {
  DocEntry: number;
  DocNum: number;
  DocDate: string;
  DocDueDate: string;
  CardCode: string;
  CardName: string;
  DocTotal: number;
  DocCurrency: string;
  PaidToDate: number;
  DocumentLines: DocumentLine[];
}

export interface InvoiceListResponse {
  values: Invoice[];
  recordCount: number;
  pageCount: number;
  pageNumber: number;
}
