import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { B2bService, ScheduledOrder } from '../../../core/services/b2b/b2b.service';

@Component({
  selector: 'app-b2b-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Orders</h1>
          <p class="text-gray-500 mt-1">View and track all your scheduled orders</p>
        </div>
        <a
          routerLink="/b2b/new-order"
          class="inline-flex items-center justify-center gap-2 bg-[#42af57] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#3d9332] transition-all"
        >
          <i class="fas fa-plus"></i>
          New Order
        </a>
      </div>

      <!-- Search and Filter Bar -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1 relative">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search by order number..."
              class="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#42af57] focus:outline-none"
            />
          </div>

          <!-- Status Filter -->
          <select
            [(ngModel)]="statusFilter"
            class="px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#42af57] focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Ordered">Ordered</option>
            <option value="OrderedAndPaid">Ordered & Paid</option>
            <option value="Invoiced">Invoiced</option>
            <option value="InvoicedAndPaid">Invoiced & Paid</option>
            <option value="Failed">Failed</option>
          </select>

          <!-- Payment Filter -->
          <select
            [(ngModel)]="paymentFilter"
            class="px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#42af57] focus:outline-none cursor-pointer"
          >
            <option value="all">All Payments</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="space-y-4">
        <div *ngFor="let i of [1,2,3]" class="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div class="flex items-center justify-between mb-4">
            <div class="h-6 bg-gray-200 rounded w-32"></div>
            <div class="h-6 bg-gray-100 rounded w-20"></div>
          </div>
          <div class="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
          <div class="h-4 bg-gray-100 rounded w-1/3"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredOrders.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-shopping-bag text-gray-400 text-3xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
        <p class="text-gray-500 mb-6">
          {{ searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' ? 'Try adjusting your filters' : 'You haven\\'t placed any orders yet' }}
        </p>
        <a
          routerLink="/b2b/new-order"
          class="inline-flex items-center gap-2 bg-[#42af57] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#3d9332] transition-all"
        >
          <i class="fas fa-plus"></i>
          Create Your First Order
        </a>
      </div>

      <!-- Orders List -->
      <div *ngIf="!isLoading && filteredOrders.length > 0" class="space-y-4">
        <div
          *ngFor="let order of filteredOrders"
          class="bg-white rounded-xl border-2 border-gray-200 hover:border-[#42af57] transition-all overflow-hidden cursor-pointer"
          [routerLink]="['/b2b/orders', order.DocEntry]"
        >
          <div class="p-5">
            <!-- Order Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-[#42af57]/10 rounded-xl flex items-center justify-center">
                  <i class="fas fa-shopping-bag text-[#42af57] text-xl"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-gray-900">Order #{{ order.DocNum }}</h3>
                    <span
                      class="text-xs px-2.5 py-1 rounded-full font-medium"
                      [ngClass]="getStatusClass(order.U_Status)"
                    >
                      {{ formatStatus(order.U_Status) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500">
                    Created {{ order.CreateDate | date:'MMM d, yyyy' }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold text-gray-900">
                  {{ order.U_DocCurrency }} {{ order.U_DocTotal | number:'1.2-2' }}
                </p>
                <span
                  class="text-xs px-2 py-0.5 rounded-full"
                  [ngClass]="getPaymentStatusClass(order.U_PaymentStatus)"
                >
                  <i class="fas fa-circle text-[6px] mr-1"></i>
                  {{ order.U_PaymentStatus }}
                </span>
              </div>
            </div>

            <!-- Order Details -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-gray-100">
              <div>
                <p class="text-xs text-gray-500 mb-1">Delivery Date</p>
                <p class="font-medium text-gray-900">
                  <i class="fas fa-truck text-gray-400 mr-1.5"></i>
                  {{ order.U_DeliveryDate | date:'MMM d, yyyy' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Items</p>
                <p class="font-medium text-gray-900">
                  <i class="fas fa-box text-gray-400 mr-1.5"></i>
                  {{ order.ONA_SPOR1Collection?.length || 0 }} products
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Payment Method</p>
                <p class="font-medium text-gray-900">
                  <i class="fas fa-credit-card text-gray-400 mr-1.5"></i>
                  {{ order.U_PaymentMethod || 'COD' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Schedule</p>
                <p class="font-medium text-gray-900">
                  <i class="fas fa-calendar text-gray-400 mr-1.5"></i>
                  #{{ order.U_FODocEntry }}
                </p>
              </div>
            </div>

            <!-- Quick Preview of Items -->
            <div *ngIf="order.ONA_SPOR1Collection && order.ONA_SPOR1Collection.length > 0" class="pt-4 border-t border-gray-100">
              <p class="text-xs text-gray-500 mb-2">Order Items</p>
              <div class="flex flex-wrap gap-2">
                <span
                  *ngFor="let item of order.ONA_SPOR1Collection.slice(0, 3)"
                  class="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg"
                >
                  {{ item.U_ItemName }} (x{{ item.U_QuantityOrdered }})
                </span>
                <span
                  *ngIf="order.ONA_SPOR1Collection.length > 3"
                  class="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg"
                >
                  +{{ order.ONA_SPOR1Collection.length - 3 }} more
                </span>
              </div>
            </div>
          </div>

          <!-- View Details Footer -->
          <div class="px-5 py-3 bg-gray-50 flex items-center justify-between">
            <span class="text-sm text-gray-500">Click to view order details</span>
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div *ngIf="!isLoading && orders.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p class="text-2xl font-bold text-gray-900">{{ orders.length }}</p>
          <p class="text-sm text-gray-500">Total Orders</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p class="text-2xl font-bold text-yellow-600">{{ getPendingCount() }}</p>
          <p class="text-sm text-gray-500">Pending</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ getCompletedCount() }}</p>
          <p class="text-sm text-gray-500">Completed</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p class="text-2xl font-bold text-gray-900">{{ getTotalValue() | currency:'USD':'symbol':'1.0-0' }}</p>
          <p class="text-sm text-gray-500">Total Value</p>
        </div>
      </div>
    </div>
  `
})
export class B2bOrdersComponent implements OnInit {
  orders: ScheduledOrder[] = [];
  isLoading = true;
  searchQuery = '';
  statusFilter = 'all';
  paymentFilter = 'all';

  constructor(private b2bService: B2bService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.b2bService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: () => {
        // Mock data for presentation
        this.orders = [
          {
            DocNum: 2003,
            DocEntry: 103,
            CreateDate: '2026-01-14T00:00:00',
            U_CardCode: 'C001',
            U_CardName: 'Test Business',
            U_DeliveryDate: '2026-01-18',
            U_DocCurrency: 'USD',
            U_DocTotal: 2450.00,
            U_Status: 'Ordered',
            U_PaymentStatus: 'Pending',
            U_PaymentMethod: 'COD',
            U_FODocEntry: 1,
            ONA_SPOR1Collection: [
              { U_ItemCode: 'MILK001', U_ItemName: 'Fresh Milk 1L', U_QuantityOrdered: 50, U_PriceAfterVAT: 1.50 },
              { U_ItemCode: 'YOG001', U_ItemName: 'Plain Yoghurt 500ml', U_QuantityOrdered: 30, U_PriceAfterVAT: 2.00 },
              { U_ItemCode: 'CHE001', U_ItemName: 'Cheddar Cheese 200g', U_QuantityOrdered: 20, U_PriceAfterVAT: 3.50 },
              { U_ItemCode: 'BUT001', U_ItemName: 'Butter 250g', U_QuantityOrdered: 25, U_PriceAfterVAT: 4.00 }
            ]
          } as any,
          {
            DocNum: 2002,
            DocEntry: 102,
            CreateDate: '2026-01-10T00:00:00',
            U_CardCode: 'C001',
            U_CardName: 'Test Business',
            U_DeliveryDate: '2026-01-15',
            U_DocCurrency: 'USD',
            U_DocTotal: 1890.50,
            U_Status: 'OrderedAndPaid',
            U_PaymentStatus: 'Paid',
            U_PaymentMethod: 'Bank Transfer',
            U_FODocEntry: 1,
            ONA_SPOR1Collection: [
              { U_ItemCode: 'MILK001', U_ItemName: 'Fresh Milk 1L', U_QuantityOrdered: 100, U_PriceAfterVAT: 1.50 },
              { U_ItemCode: 'CRE001', U_ItemName: 'Fresh Cream 250ml', U_QuantityOrdered: 40, U_PriceAfterVAT: 2.50 }
            ]
          } as any,
          {
            DocNum: 2001,
            DocEntry: 101,
            CreateDate: '2026-01-05T00:00:00',
            U_CardCode: 'C001',
            U_CardName: 'Test Business',
            U_DeliveryDate: '2026-01-10',
            U_DocCurrency: 'USD',
            U_DocTotal: 3250.00,
            U_Status: 'InvoicedAndPaid',
            U_PaymentStatus: 'Paid',
            U_PaymentMethod: 'EcoCash',
            U_FODocEntry: 2,
            ONA_SPOR1Collection: [
              { U_ItemCode: 'MILK001', U_ItemName: 'Fresh Milk 1L', U_QuantityOrdered: 200, U_PriceAfterVAT: 1.50 },
              { U_ItemCode: 'YOG001', U_ItemName: 'Plain Yoghurt 500ml', U_QuantityOrdered: 100, U_PriceAfterVAT: 2.00 },
              { U_ItemCode: 'CHE001', U_ItemName: 'Cheddar Cheese 200g', U_QuantityOrdered: 50, U_PriceAfterVAT: 3.50 }
            ]
          } as any,
          {
            DocNum: 2000,
            DocEntry: 100,
            CreateDate: '2025-12-28T00:00:00',
            U_CardCode: 'C001',
            U_CardName: 'Test Business',
            U_DeliveryDate: '2026-01-03',
            U_DocCurrency: 'USD',
            U_DocTotal: 1500.00,
            U_Status: 'Invoiced',
            U_PaymentStatus: 'Partial',
            U_PaymentMethod: 'COD',
            U_FODocEntry: 3,
            ONA_SPOR1Collection: [
              { U_ItemCode: 'MILK001', U_ItemName: 'Fresh Milk 1L', U_QuantityOrdered: 150, U_PriceAfterVAT: 1.50 }
            ]
          } as any
        ];
        this.isLoading = false;
      }
    });
  }

  get filteredOrders(): ScheduledOrder[] {
    return this.orders.filter(order => {
      const matchesSearch = !this.searchQuery ||
        order.DocNum.toString().includes(this.searchQuery) ||
        order.U_CardName?.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' || order.U_Status === this.statusFilter;
      const matchesPayment = this.paymentFilter === 'all' || order.U_PaymentStatus === this.paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }

  getStatusClass(status: string): string {
    return this.b2bService.getStatusColor(status);
  }

  getPaymentStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Partial': 'bg-orange-100 text-orange-700',
      'Paid': 'bg-green-100 text-green-700',
      'None': 'bg-gray-100 text-gray-700'
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
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

  getPendingCount(): number {
    return this.orders.filter(o => o.U_Status === 'Ordered' || o.U_Status === 'OrderedAndPaid').length;
  }

  getCompletedCount(): number {
    return this.orders.filter(o => o.U_Status === 'Invoiced' || o.U_Status === 'InvoicedAndPaid').length;
  }

  getTotalValue(): number {
    return this.orders.reduce((sum, o) => sum + (o.U_DocTotal || 0), 0);
  }
}
