import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

// API returns lowercase, but we normalize to PascalCase for consistency
export interface StoreOrderSchedule {
  DocEntry: number;
  DocNum: number;
  Remark: string;
  StartDate: string;
  EndDate: string;
  StartDeliveryDate: string;
  EndDeliveryDate: string;
  Status: 'Open' | 'Closed' | 'Invoiced' | 'Cancelled';
  AvailableDeliveryDates: string[];
}

// Raw API response interface (lowercase)
interface ApiScheduleResponse {
  docEntry: number;
  docNum: number;
  remark: string;
  startDate: string;
  endDate: string;
  startDeliveryDate: string;
  endDeliveryDate: string;
  status: 'Open' | 'Closed' | 'Invoiced' | 'Cancelled';
  availableDeliveryDates: string[];
}

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

export interface CreateCartRequest {
  CartTime: string;
  CartId: string | null;
  ScheduleDocEntry: number;
  DeliveryDate: string;
  DocCurrency: string;
  Comments: string;
  DocTotal: number;
  DocumentLines: ScheduledOrderLine[];
}

export interface CartResponse {
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

export interface ScheduledOrder {
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
  U_Status: 'None' | 'Invoiced' | 'InvoicedAndPaid' | 'Ordered' | 'OrderedAndPaid' | 'Failed';
  U_StatusSummary: string;
  U_SAPDocEntry: number;
  U_PaymentStatus: 'None' | 'Pending' | 'Partial' | 'Paid';
  U_PaymentReference: string | null;
  U_FODocEntry: number;
  U_InvoiceType: 'None' | 'ARReserve' | 'ARInvoice' | 'SalesOrder';
  ONA_SPOR1Collection: OrderLineItem[];
}

export interface OrderLineItem {
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

@Injectable({
  providedIn: 'root'
})
export class B2bService {
  private apiUrl = environment.authUrl;

  constructor(private http: HttpClient) {}

  // Get available order schedules - maps lowercase API response to PascalCase
  getAvailableSchedules(): Observable<StoreOrderSchedule[]> {
    return this.http.get<ApiScheduleResponse[]>(`${this.apiUrl}StoreOrderSchedules/Available`).pipe(
      map((response: ApiScheduleResponse[]) => response.map(item => this.mapScheduleResponse(item)))
    );
  }

  // Map lowercase API response to PascalCase interface
  private mapScheduleResponse(item: ApiScheduleResponse): StoreOrderSchedule {
    return {
      DocEntry: item.docEntry,
      DocNum: item.docNum,
      Remark: item.remark || '',
      StartDate: item.startDate,
      EndDate: item.endDate,
      StartDeliveryDate: item.startDeliveryDate,
      EndDeliveryDate: item.endDeliveryDate,
      Status: item.status,
      AvailableDeliveryDates: item.availableDeliveryDates || []
    };
  }

  // Create a cart for scheduled order
  createCart(cart: CreateCartRequest): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.apiUrl}StoreScheduledOrders/Cart`, cart);
  }

  // Create order from cart
  createOrder(cartId: string): Observable<ScheduledOrder> {
    return this.http.post<ScheduledOrder>(`${this.apiUrl}StoreScheduledOrders/Order`, { CartId: cartId });
  }

  // Get all orders for current customer
  getOrders(): Observable<ScheduledOrder[]> {
    return this.http.get<ScheduledOrder[]>(`${this.apiUrl}StoreScheduledOrders`);
  }

  // Get specific order by DocEntry
  getOrderById(id: number): Observable<ScheduledOrder> {
    return this.http.get<ScheduledOrder>(`${this.apiUrl}StoreScheduledOrders/${id}`);
  }

  // Helper method to get status color
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Open': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Invoiced': 'bg-blue-100 text-blue-800',
      'InvoicedAndPaid': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Ordered': 'bg-yellow-100 text-yellow-800',
      'OrderedAndPaid': 'bg-green-100 text-green-800',
      'Failed': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Partial': 'bg-orange-100 text-orange-800',
      'Paid': 'bg-green-100 text-green-800',
      'None': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Helper method to get status icon
  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Open': 'fas fa-clock',
      'Closed': 'fas fa-lock',
      'Invoiced': 'fas fa-file-invoice',
      'InvoicedAndPaid': 'fas fa-check-circle',
      'Cancelled': 'fas fa-times-circle',
      'Ordered': 'fas fa-shopping-cart',
      'OrderedAndPaid': 'fas fa-check-double',
      'Failed': 'fas fa-exclamation-circle',
      'Pending': 'fas fa-hourglass-half',
      'Partial': 'fas fa-adjust',
      'Paid': 'fas fa-check',
      'None': 'fas fa-minus'
    };
    return icons[status] || 'fas fa-question';
  }
}
