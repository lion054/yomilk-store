// Store Order Schedule types

export type OrderScheduleStatus = 'Open' | 'Closed' | 'Invoiced' | 'Cancelled';

export type SalesPersonOrderStatus =
  | 'None'
  | 'Invoiced'
  | 'InvoicedAndPaid'
  | 'Ordered'
  | 'OrderedAndPaid'
  | 'Failed';

export type PaymentStatus = 'None' | 'Pending' | 'Partial' | 'Paid';

export type InvoiceType = 'None' | 'ARReserve' | 'ARInvoice' | 'SalesOrder';

// GET api/StoreOrderSchedules/Available
export interface StoreOrderSchedule {
  DocEntry: number;
  DocNum: number;
  Remark: string;
  StartDate: string;
  EndDate: string;
  StartDeliveryDate: string;
  EndDeliveryDate: string;
  Status: OrderScheduleStatus;
  AvailableDeliveryDates: string[];
}

// Document line used in cart request/response
export interface ScheduledOrderLine {
  LineNum: number;
  ItemCode: string;
  ItemName: string;
  Quantity: number;
  PriceAfterVAT: number;
  WarehouseCode: string;
  VatGroup: string;
  VATRate: number;
  UoMEntry: number;
  UoMCode: string;
  LineTotal: number;
}

// POST api/StoreScheduledOrders/Cart - Request
export interface CreateScheduledOrderCartRequest {
  CartTime: string;
  CartId: string | null;
  ScheduleDocEntry: number;
  DeliveryDate: string;
  DocCurrency: string;
  Comments: string;
  DocTotal: number;
  DocumentLines: ScheduledOrderLine[];
}

// POST api/StoreScheduledOrders/Cart - Response
export interface ScheduledOrderCartResponse {
  CartId: string;
  CartTime: string;
  ScheduleDocEntry: number;
  DeliveryDate: string;
  CardCode: string;
  CardName: string;
  SalesPersonCode: number;
  SalesPersonName: string;
  DocCurrency: string;
  DocTotal: number;
  Comments: string;
  DocumentLines: ScheduledOrderLine[];
}

// POST api/StoreScheduledOrders/Order - Request
export interface CreateScheduledOrderRequest {
  CartId: string;
}

// Order line item in ONA_SPOR1Collection
export interface ScheduledOrderLineItem {
  DocEntry: number;
  LineId: number;
  U_ItemCode: string;
  U_ItemName: string;
  U_PriceAfterVAT: number;
  U_QuantityOrdered: number;
  U_QuantityCommited: number;
  U_FQuantityCommited: number;
  U_VatRate: number;
  U_SupplierCode: string | null;
  U_SupplierName: string | null;
  U_Warehouse: string;
  U_PLGroupName: string;
  U_PLGroupLine: number;
  U_PLCartonSize: number;
  U_PLItemCode: string;
  U_PLItemSize: string;
}

// POST api/StoreScheduledOrders/Order - Response
// GET api/StoreScheduledOrders - Response (array of this)
// GET api/StoreScheduledOrders/{id} - Response
export interface SalesPersonOrder {
  DocNum: number;
  Creator: string;
  Remark: string;
  DocEntry: number;
  UserSign: number;
  Series: number;
  CreateDate: string;
  CreateTime: string;
  UpdateDate: string;
  UpdateTime: string;
  U_CardCode: string;
  U_CardName: string;
  U_CardGroupId: number;
  U_CardGroupName: string;
  U_WCOrderId: string | null;
  U_SlpCode: number;
  U_SlpName: string;
  U_DlvryPsnCode: number;
  U_DlvryPsnName: string;
  U_DocumentDate: string;
  U_DeliveryDate: string;
  U_AddedBy: number;
  U_AddedByName: string;
  U_DocCurrency: string;
  U_DocTotal: number;
  U_PaymentMethod: string;
  U_AmountPaid: number;
  U_PaymentRate: number | null;
  U_PaymentDate: string | null;
  U_Status: SalesPersonOrderStatus;
  U_StatusSummary: string;
  U_SAPDocEntry: number;
  U_PaymentStatus: PaymentStatus;
  U_PaymentReference: string | null;
  U_FODocEntry: number;
  U_InvoiceType: InvoiceType;
  ONA_SPOR1Collection: ScheduledOrderLineItem[];
}
