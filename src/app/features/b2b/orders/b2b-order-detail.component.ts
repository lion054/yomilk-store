import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { B2bService, ScheduledOrder } from '../../../core/services/b2b/b2b.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { DialogService } from '../../../core/services/dialog/dialog.service';
import { InvoicePdfService, InvoiceData } from '../../../core/services/pdf/invoice-pdf.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-b2b-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Back Button -->
      <a routerLink="/b2b/orders" class="inline-flex items-center gap-2 text-gray-600 hover:text-[#42af57] transition-colors">
        <i class="fas fa-arrow-left"></i>
        Back to Orders
      </a>
    
      <!-- Loading State -->
      @if (isLoading) {
        <div class="space-y-6">
          <div class="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div class="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div class="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
            <div class="h-4 bg-gray-100 rounded w-1/4"></div>
          </div>
        </div>
      }
    
      <!-- Order Details -->
      @if (!isLoading && order) {
        <div>
          <!-- Order Header Card -->
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="bg-gradient-to-r from-[#42af57] to-[#2d7025] p-6 text-white">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <h1 class="text-2xl font-bold">Order #{{ order.DocNum }}</h1>
                    <span class="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {{ formatStatus(order.U_Status) }}
                    </span>
                  </div>
                  <p class="text-white/80">
                    Created on {{ order.CreateDate | date:'MMMM d, yyyy' }} at {{ order.CreateDate | date:'h:mm a' }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-white/70">Total Amount</p>
                  <p class="text-3xl font-bold">{{ order.U_DocCurrency }} {{ order.U_DocTotal | number:'1.2-2' }}</p>
                </div>
              </div>
            </div>
            <!-- Order Info Grid -->
            <div class="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 border-b border-gray-100">
              <div>
                <p class="text-sm text-gray-500 mb-1">Delivery Date</p>
                <p class="font-semibold text-gray-900 flex items-center gap-2">
                  <i class="fas fa-truck text-[#42af57]"></i>
                  {{ order.U_DeliveryDate | date:'MMM d, yyyy' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Payment Status</p>
                <p class="font-semibold flex items-center gap-2">
                  <span
                    class="w-2 h-2 rounded-full"
                  [ngClass]="{
                    'bg-yellow-500': order.U_PaymentStatus === 'Pending',
                    'bg-orange-500': order.U_PaymentStatus === 'Partial',
                    'bg-green-500': order.U_PaymentStatus === 'Paid',
                    'bg-gray-400': order.U_PaymentStatus === 'None'
                  }"
                  ></span>
                  {{ order.U_PaymentStatus }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Payment Method</p>
                <p class="font-semibold text-gray-900 flex items-center gap-2">
                  <i class="fas fa-credit-card text-gray-400"></i>
                  {{ order.U_PaymentMethod || 'Cash on Delivery' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Schedule Reference</p>
                <p class="font-semibold text-gray-900 flex items-center gap-2">
                  <i class="fas fa-calendar text-gray-400"></i>
                  #{{ order.U_FODocEntry }}
                </p>
              </div>
            </div>
            <!-- Amount Details -->
            <div class="p-6 grid grid-cols-2 gap-6 bg-gray-50">
              <div>
                <p class="text-sm text-gray-500 mb-1">Amount Paid</p>
                <p class="text-xl font-bold text-green-600">
                  {{ order.U_DocCurrency }} {{ order.U_AmountPaid | number:'1.2-2' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 mb-1">Balance Due</p>
                <p class="text-xl font-bold" [ngClass]="getBalanceDue() > 0 ? 'text-red-600' : 'text-gray-900'">
                  {{ order.U_DocCurrency }} {{ getBalanceDue() | number:'1.2-2' }}
                </p>
              </div>
            </div>
          </div>
          <!-- Order Timeline -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-history text-[#42af57] mr-2"></i>
              Order Timeline
            </h2>
            <div class="relative">
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div class="space-y-6">
                <div class="relative flex items-start gap-4 pl-10">
                  <div class="absolute left-2 w-5 h-5 bg-[#42af57] rounded-full flex items-center justify-center">
                    <i class="fas fa-check text-white text-xs"></i>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">Order Placed</p>
                    <p class="text-sm text-gray-500">{{ order.CreateDate | date:'MMM d, yyyy h:mm a' }}</p>
                  </div>
                </div>
                @if (order.U_Status !== 'Failed') {
                  <div class="relative flex items-start gap-4 pl-10">
                    <div
                      class="absolute left-2 w-5 h-5 rounded-full flex items-center justify-center"
                      [ngClass]="isProcessed() ? 'bg-[#42af57]' : 'bg-gray-300'"
                      >
                      @if (isProcessed()) {
                        <i class="fas fa-check text-white text-xs"></i>
                      }
                    </div>
                    <div>
                      <p class="font-medium" [ngClass]="isProcessed() ? 'text-gray-900' : 'text-gray-400'">Processing</p>
                      <p class="text-sm text-gray-500">Order is being prepared</p>
                    </div>
                  </div>
                }
                @if (order.U_Status !== 'Failed') {
                  <div class="relative flex items-start gap-4 pl-10">
                    <div
                      class="absolute left-2 w-5 h-5 rounded-full flex items-center justify-center"
                      [ngClass]="isInvoiced() ? 'bg-[#42af57]' : 'bg-gray-300'"
                      >
                      @if (isInvoiced()) {
                        <i class="fas fa-check text-white text-xs"></i>
                      }
                    </div>
                    <div>
                      <p class="font-medium" [ngClass]="isInvoiced() ? 'text-gray-900' : 'text-gray-400'">Invoiced</p>
                      <p class="text-sm text-gray-500">Invoice generated</p>
                    </div>
                  </div>
                }
                @if (order.U_Status !== 'Failed') {
                  <div class="relative flex items-start gap-4 pl-10">
                    <div
                      class="absolute left-2 w-5 h-5 rounded-full flex items-center justify-center"
                      [ngClass]="isCompleted() ? 'bg-[#42af57]' : 'bg-gray-300'"
                      >
                      @if (isCompleted()) {
                        <i class="fas fa-check text-white text-xs"></i>
                      }
                    </div>
                    <div>
                      <p class="font-medium" [ngClass]="isCompleted() ? 'text-gray-900' : 'text-gray-400'">Completed</p>
                      <p class="text-sm text-gray-500">Order delivered and paid</p>
                    </div>
                  </div>
                }
                @if (order.U_Status === 'Failed') {
                  <div class="relative flex items-start gap-4 pl-10">
                    <div class="absolute left-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <i class="fas fa-times text-white text-xs"></i>
                    </div>
                    <div>
                      <p class="font-medium text-red-600">Order Failed</p>
                      <p class="text-sm text-gray-500">{{ order.U_StatusSummary || 'There was an issue with this order' }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
          <!-- Order Items -->
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="p-6 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">
                <i class="fas fa-box text-[#42af57] mr-2"></i>
                Order Items ({{ order.ONA_SPOR1Collection?.length || 0 }})
              </h2>
            </div>
            <!-- Desktop Table -->
            <div class="hidden sm:block overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">VAT</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (item of order.ONA_SPOR1Collection; track item) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <i class="fas fa-box text-gray-400"></i>
                          </div>
                          <div>
                            <p class="font-medium text-gray-900">{{ item.U_ItemName }}</p>
                            <p class="text-sm text-gray-500">{{ item.U_ItemCode }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-right text-gray-900">
                        {{ order.U_DocCurrency }} {{ item.U_PriceAfterVAT | number:'1.2-2' }}
                      </td>
                      <td class="px-6 py-4 text-right font-medium text-gray-900">
                        {{ item.U_QuantityOrdered }}
                      </td>
                      <td class="px-6 py-4 text-right text-gray-500">
                        {{ item.U_VatRate }}%
                      </td>
                      <td class="px-6 py-4 text-right font-semibold text-gray-900">
                        {{ order.U_DocCurrency }} {{ (item.U_PriceAfterVAT * item.U_QuantityOrdered) | number:'1.2-2' }}
                      </td>
                    </tr>
                  }
                </tbody>
                <tfoot class="bg-gray-50">
                  <tr>
                    <td colspan="4" class="px-6 py-4 text-right font-semibold text-gray-900">Grand Total</td>
                    <td class="px-6 py-4 text-right text-xl font-bold text-[#42af57]">
                      {{ order.U_DocCurrency }} {{ order.U_DocTotal | number:'1.2-2' }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <!-- Mobile Cards -->
            <div class="sm:hidden divide-y divide-gray-100">
              @for (item of order.ONA_SPOR1Collection; track item) {
                <div class="p-4">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-box text-gray-400"></i>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ item.U_ItemName }}</p>
                        <p class="text-sm text-gray-500">{{ item.U_ItemCode }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 flex items-center justify-between text-sm">
                    <span class="text-gray-500">
                      {{ order.U_DocCurrency }} {{ item.U_PriceAfterVAT | number:'1.2-2' }} x {{ item.U_QuantityOrdered }}
                    </span>
                    <span class="font-semibold text-gray-900">
                      {{ order.U_DocCurrency }} {{ (item.U_PriceAfterVAT * item.U_QuantityOrdered) | number:'1.2-2' }}
                    </span>
                  </div>
                </div>
              }
              <div class="p-4 bg-gray-50 flex items-center justify-between">
                <span class="font-semibold text-gray-900">Grand Total</span>
                <span class="text-xl font-bold text-[#42af57]">
                  {{ order.U_DocCurrency }} {{ order.U_DocTotal | number:'1.2-2' }}
                </span>
              </div>
            </div>
          </div>
          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              (click)="downloadInvoice()"
              class="flex-1 inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold hover:border-[#42af57] hover:text-[#42af57] transition-all active:scale-95"
              >
              <i class="fas fa-download"></i>
              Download Invoice
            </button>
            <button
              (click)="reorderItems()"
              class="flex-1 inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold hover:border-[#42af57] hover:text-[#42af57] transition-all active:scale-95"
              >
              <i class="fas fa-redo"></i>
              Reorder
            </button>
            <a
              href="mailto:support@snappyfresh.net?subject=Order%20%23{{ order.DocNum }}%20Support"
              class="flex-1 inline-flex items-center justify-center gap-2 bg-[#42af57] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#3d9332] transition-all active:scale-95"
              >
              <i class="fas fa-headset"></i>
              Get Support
            </a>
          </div>
        </div>
      }
    
      <!-- Not Found -->
      @if (!isLoading && !order) {
        <div class="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-search text-gray-400 text-3xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Order not found</h3>
          <p class="text-gray-500 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <a
            routerLink="/b2b/orders"
            class="inline-flex items-center gap-2 text-[#42af57] font-medium hover:underline"
            >
            <i class="fas fa-arrow-left"></i>
            Back to Orders
          </a>
        </div>
      }
    </div>
    `
})
export class B2bOrderDetailComponent implements OnInit {
  order: ScheduledOrder | null = null;
  isLoading = true;

  constructor(
    private b2bService: B2bService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private dialogService: DialogService,
    private invoicePdfService: InvoicePdfService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(parseInt(id, 10));
    } else {
      this.isLoading = false;
    }
  }

  loadOrder(id: number): void {
    this.isLoading = true;
    this.b2bService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: () => {
        // Mock data for presentation
        this.order = {
          DocNum: 2003,
          DocEntry: id,
          Creator: 'System',
          Remark: '',
          UserSign: 1,
          Series: 1,
          CreateDate: '2026-01-14T10:30:00',
          CreateTime: '10:30:00',
          UpdateDate: '2026-01-14T10:30:00',
          UpdateTime: '10:30:00',
          U_CardCode: 'C001',
          U_CardName: 'Business Partner Ltd',
          U_CardGroupId: 1,
          U_CardGroupName: 'Retail',
          U_WCOrderId: null,
          U_SlpCode: 5,
          U_SlpName: 'Sales Rep',
          U_DlvryPsnCode: 10,
          U_DlvryPsnName: 'Delivery Person',
          U_DocumentDate: '2026-01-14',
          U_DeliveryDate: '2026-01-18',
          U_AddedBy: 1,
          U_AddedByName: 'User',
          U_DocCurrency: 'USD',
          U_DocTotal: 2450.00,
          U_PaymentMethod: 'COD',
          U_AmountPaid: 0,
          U_PaymentRate: null,
          U_PaymentDate: null,
          U_Status: 'Ordered',
          U_StatusSummary: '',
          U_SAPDocEntry: 0,
          U_PaymentStatus: 'Pending',
          U_PaymentReference: null,
          U_FODocEntry: 1,
          U_InvoiceType: 'ARReserve',
          ONA_SPOR1Collection: [
            {
              DocEntry: id,
              LineId: 0,
              U_ItemCode: 'MILK001',
              U_ItemName: 'Fresh Milk 1L',
              U_PriceAfterVAT: 1.50,
              U_QuantityOrdered: 100,
              U_QuantityCommited: 0,
              U_FQuantityCommited: 0,
              U_VatRate: 15,
              U_SupplierCode: null,
              U_SupplierName: null,
              U_Warehouse: 'WH01',
              U_PLGroupName: 'Dairy',
              U_PLGroupLine: 1,
              U_PLCartonSize: 12,
              U_PLItemCode: 'MILK001',
              U_PLItemSize: '1L'
            },
            {
              DocEntry: id,
              LineId: 1,
              U_ItemCode: 'YOG001',
              U_ItemName: 'Plain Yoghurt 500ml',
              U_PriceAfterVAT: 2.00,
              U_QuantityOrdered: 50,
              U_QuantityCommited: 0,
              U_FQuantityCommited: 0,
              U_VatRate: 15,
              U_SupplierCode: null,
              U_SupplierName: null,
              U_Warehouse: 'WH01',
              U_PLGroupName: 'Dairy',
              U_PLGroupLine: 2,
              U_PLCartonSize: 24,
              U_PLItemCode: 'YOG001',
              U_PLItemSize: '500ml'
            },
            {
              DocEntry: id,
              LineId: 2,
              U_ItemCode: 'CHE001',
              U_ItemName: 'Cheddar Cheese 200g',
              U_PriceAfterVAT: 3.50,
              U_QuantityOrdered: 30,
              U_QuantityCommited: 0,
              U_FQuantityCommited: 0,
              U_VatRate: 15,
              U_SupplierCode: null,
              U_SupplierName: null,
              U_Warehouse: 'WH01',
              U_PLGroupName: 'Dairy',
              U_PLGroupLine: 3,
              U_PLCartonSize: 20,
              U_PLItemCode: 'CHE001',
              U_PLItemSize: '200g'
            },
            {
              DocEntry: id,
              LineId: 3,
              U_ItemCode: 'CRE001',
              U_ItemName: 'Fresh Cream 250ml',
              U_PriceAfterVAT: 2.50,
              U_QuantityOrdered: 40,
              U_QuantityCommited: 0,
              U_FQuantityCommited: 0,
              U_VatRate: 15,
              U_SupplierCode: null,
              U_SupplierName: null,
              U_Warehouse: 'WH01',
              U_PLGroupName: 'Dairy',
              U_PLGroupLine: 4,
              U_PLCartonSize: 24,
              U_PLItemCode: 'CRE001',
              U_PLItemSize: '250ml'
            }
          ]
        };
        this.isLoading = false;
      }
    });
  }

  formatStatus(status: string): string {
    const formatted: { [key: string]: string } = {
      'Ordered': 'Ordered',
      'OrderedAndPaid': 'Ordered & Paid',
      'Invoiced': 'Invoiced',
      'InvoicedAndPaid': 'Completed',
      'Failed': 'Failed',
      'None': 'Unknown'
    };
    return formatted[status] || status;
  }

  getBalanceDue(): number {
    if (!this.order) return 0;
    return this.order.U_DocTotal - (this.order.U_AmountPaid || 0);
  }

  isProcessed(): boolean {
    return this.order?.U_Status !== 'None';
  }

  isInvoiced(): boolean {
    return this.order?.U_Status === 'Invoiced' || this.order?.U_Status === 'InvoicedAndPaid';
  }

  isCompleted(): boolean {
    return this.order?.U_Status === 'InvoicedAndPaid';
  }

  downloadInvoice(): void {
    if (!this.order) return;

    const user = this.authService.getAuthUser();
    const customer = user?.customer as any;

    const invoiceData: InvoiceData = {
      docNum: this.order.DocNum?.toString() || 'ORD-' + this.order.DocEntry,
      invoiceDate: this.order.CreateDate || new Date().toISOString(),
      dueDate: this.order.U_DeliveryDate,
      status: this.formatStatus(this.order.U_Status),
      currency: this.order.U_DocCurrency || 'USD',
      amount: this.order.U_DocTotal || 0,
      paidAmount: this.order.U_AmountPaid || 0,
      description: `Order #${this.order.DocNum}`,
      customer: {
        name: customer?.cardName || this.order.U_CardName || 'Business Customer',
        address: customer?.address || '',
        phone: customer?.phone || '',
        email: customer?.email || ''
      },
      items: this.order.ONA_SPOR1Collection?.map(item => ({
        itemCode: item.U_ItemCode,
        description: item.U_ItemName,
        quantity: item.U_QuantityOrdered,
        unitPrice: item.U_PriceAfterVAT,
        total: item.U_PriceAfterVAT * item.U_QuantityOrdered
      }))
    };

    this.invoicePdfService.generateInvoicePdf(invoiceData);
    this.toastService.success('Invoice Downloaded', 'Your invoice PDF has been generated');
  }

  async reorderItems(): Promise<void> {
    if (!this.order?.ONA_SPOR1Collection?.length) {
      this.toastService.warning('No Items', 'This order has no items to reorder');
      return;
    }

    const confirmed = await this.dialogService.confirm({
      title: 'Reorder Items',
      message: `This will create a new order with ${this.order.ONA_SPOR1Collection.length} items from Order #${this.order.DocNum}. You'll be able to modify quantities before placing the order.`,
      type: 'confirm',
      confirmText: 'Continue',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      // Store reorder items in session storage for the new order page
      const reorderItems = this.order.ONA_SPOR1Collection.map(item => ({
        ItemCode: item.U_ItemCode,
        ItemName: item.U_ItemName,
        Quantity: item.U_QuantityOrdered,
        PriceAfterVAT: item.U_PriceAfterVAT,
        VATRate: item.U_VatRate
      }));

      sessionStorage.setItem('b2b_reorder_items', JSON.stringify(reorderItems));
      this.toastService.info('Reorder Started', 'Redirecting to new order page...');

      // Navigate to new order page
      this.router.navigate(['/b2b/new-order'], {
        queryParams: { reorder: 'true' }
      });
    }
  }
}
