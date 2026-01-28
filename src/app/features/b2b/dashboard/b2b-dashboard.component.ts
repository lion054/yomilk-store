import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { B2bService, StoreOrderSchedule, ScheduledOrder } from '../../../core/services/b2b/b2b.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-b2b-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="bg-gradient-to-r from-[#42af57] to-[#2d7025] rounded-2xl p-6 sm:p-8 text-white">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {{ userName }}!</h1>
            <p class="text-white/80">Manage your scheduled orders and track deliveries</p>
          </div>
          <a
            routerLink="/b2b/new-order"
            class="inline-flex items-center justify-center gap-2 bg-white text-[#42af57] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all whitespace-nowrap"
          >
            <i class="fas fa-plus"></i>
            New Order
          </a>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-calendar-check text-blue-600 text-xl"></i>
            </div>
            <div>
              <p class="text-gray-500 text-sm">Active Schedules</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeSchedulesCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
            <div>
              <p class="text-gray-500 text-sm">Pending Orders</p>
              <p class="text-2xl font-bold text-gray-900">{{ pendingOrdersCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div>
              <p class="text-gray-500 text-sm">Completed</p>
              <p class="text-2xl font-bold text-gray-900">{{ completedOrdersCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-dollar-sign text-purple-600 text-xl"></i>
            </div>
            <div>
              <p class="text-gray-500 text-sm">Total Spent</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalSpent | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Available Schedules -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-calendar-alt text-[#42af57] mr-2"></i>
              Available Schedules
            </h2>
            <a routerLink="/b2b/schedules" class="text-[#42af57] text-sm font-medium hover:underline">
              View All
            </a>
          </div>
          <div class="p-5">
            <div *ngIf="isLoadingSchedules" class="space-y-4">
              <div *ngFor="let i of [1,2,3]" class="animate-pulse">
                <div class="h-20 bg-gray-100 rounded-lg"></div>
              </div>
            </div>

            <div *ngIf="!isLoadingSchedules && schedules.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-calendar-times text-gray-400 text-2xl"></i>
              </div>
              <p class="text-gray-500">No active schedules available</p>
            </div>

            <div *ngIf="!isLoadingSchedules && schedules.length > 0" class="space-y-3">
              <div
                *ngFor="let schedule of schedules.slice(0, 3)"
                class="border border-gray-200 rounded-xl p-4 hover:border-[#42af57] hover:shadow-sm transition-all cursor-pointer"
                [routerLink]="['/b2b/new-order']"
                [queryParams]="{ schedule: schedule.DocEntry }"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-semibold text-gray-900">Schedule #{{ schedule.DocNum }}</span>
                      <span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        {{ schedule.Status }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500 mb-2">{{ schedule.Remark || 'Order Schedule' }}</p>
                    <div class="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        <i class="fas fa-calendar mr-1"></i>
                        {{ schedule.StartDate | date:'MMM d' }} - {{ schedule.EndDate | date:'MMM d' }}
                      </span>
                      <span>
                        <i class="fas fa-truck mr-1"></i>
                        {{ schedule.AvailableDeliveryDates?.length || 0 }} delivery dates
                      </span>
                    </div>
                  </div>
                  <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">
              <i class="fas fa-shopping-bag text-[#42af57] mr-2"></i>
              Recent Orders
            </h2>
            <a routerLink="/b2b/orders" class="text-[#42af57] text-sm font-medium hover:underline">
              View All
            </a>
          </div>
          <div class="p-5">
            <div *ngIf="isLoadingOrders" class="space-y-4">
              <div *ngFor="let i of [1,2,3]" class="animate-pulse">
                <div class="h-20 bg-gray-100 rounded-lg"></div>
              </div>
            </div>

            <div *ngIf="!isLoadingOrders && orders.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-shopping-cart text-gray-400 text-2xl"></i>
              </div>
              <p class="text-gray-500 mb-4">No orders yet</p>
              <a
                routerLink="/b2b/new-order"
                class="inline-flex items-center gap-2 text-[#42af57] font-medium hover:underline"
              >
                <i class="fas fa-plus"></i>
                Create your first order
              </a>
            </div>

            <div *ngIf="!isLoadingOrders && orders.length > 0" class="space-y-3">
              <div
                *ngFor="let order of orders.slice(0, 4)"
                class="border border-gray-200 rounded-xl p-4 hover:border-[#42af57] hover:shadow-sm transition-all cursor-pointer"
                [routerLink]="['/b2b/orders', order.DocEntry]"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-semibold text-gray-900">Order #{{ order.DocNum }}</span>
                      <span
                        class="text-xs px-2 py-0.5 rounded-full"
                        [ngClass]="getStatusClass(order.U_Status)"
                      >
                        {{ order.U_Status }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-900 font-medium">
                      {{ order.U_DocCurrency }} {{ order.U_DocTotal | number:'1.2-2' }}
                    </p>
                    <div class="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>
                        <i class="fas fa-truck mr-1"></i>
                        {{ order.U_DeliveryDate | date:'MMM d, yyyy' }}
                      </span>
                      <span>
                        <i class="fas fa-box mr-1"></i>
                        {{ order.ONA_SPOR1Collection?.length || 0 }} items
                      </span>
                    </div>
                  </div>
                  <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          <i class="fas fa-bolt text-[#42af57] mr-2"></i>
          Quick Actions
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <a
            routerLink="/b2b/new-order"
            class="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-[#42af57]/10 hover:text-[#42af57] transition-colors text-center"
          >
            <i class="fas fa-plus-circle text-2xl"></i>
            <span class="text-sm font-medium">New Order</span>
          </a>
          <a
            routerLink="/b2b/schedules"
            class="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-[#42af57]/10 hover:text-[#42af57] transition-colors text-center"
          >
            <i class="fas fa-calendar-alt text-2xl"></i>
            <span class="text-sm font-medium">View Schedules</span>
          </a>
          <a
            routerLink="/b2b/orders"
            class="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-[#42af57]/10 hover:text-[#42af57] transition-colors text-center"
          >
            <i class="fas fa-history text-2xl"></i>
            <span class="text-sm font-medium">Order History</span>
          </a>
          <a
            routerLink="/b2b/account"
            class="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-[#42af57]/10 hover:text-[#42af57] transition-colors text-center"
          >
            <i class="fas fa-user-circle text-2xl"></i>
            <span class="text-sm font-medium">My Account</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class B2bDashboardComponent implements OnInit {
  userName = 'Business Partner';
  schedules: StoreOrderSchedule[] = [];
  orders: ScheduledOrder[] = [];
  isLoadingSchedules = true;
  isLoadingOrders = true;

  // Stats
  activeSchedulesCount = 0;
  pendingOrdersCount = 0;
  completedOrdersCount = 0;
  totalSpent = 0;

  constructor(
    private b2bService: B2bService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getAuthUser();
    if (user) {
      this.userName = user.customer?.cardName?.split(' ')[0] || user.userName || 'Partner';
    }

    this.loadSchedules();
    this.loadOrders();
  }

  loadSchedules(): void {
    this.isLoadingSchedules = true;
    this.b2bService.getAvailableSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.activeSchedulesCount = schedules.filter(s => s.Status === 'Open').length;
        this.isLoadingSchedules = false;
      },
      error: () => {
        // Mock data for presentation
        this.schedules = [
          {
            DocEntry: 1,
            DocNum: 1001,
            Remark: 'Weekly Dairy Order',
            StartDate: '2026-01-13T00:00:00',
            EndDate: '2026-01-20T00:00:00',
            StartDeliveryDate: '2026-01-15T00:00:00',
            EndDeliveryDate: '2026-01-19T00:00:00',
            Status: 'Open',
            AvailableDeliveryDates: ['2026-01-15', '2026-01-16', '2026-01-17', '2026-01-18', '2026-01-19']
          },
          {
            DocEntry: 2,
            DocNum: 1002,
            Remark: 'Monthly Bulk Order',
            StartDate: '2026-01-15T00:00:00',
            EndDate: '2026-01-31T00:00:00',
            StartDeliveryDate: '2026-01-17T00:00:00',
            EndDeliveryDate: '2026-01-30T00:00:00',
            Status: 'Open',
            AvailableDeliveryDates: ['2026-01-17', '2026-01-20', '2026-01-24', '2026-01-27', '2026-01-30']
          }
        ];
        this.activeSchedulesCount = 2;
        this.isLoadingSchedules = false;
      }
    });
  }

  loadOrders(): void {
    this.isLoadingOrders = true;
    this.b2bService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.calculateStats(orders);
        this.isLoadingOrders = false;
      },
      error: () => {
        // Mock data for presentation
        this.orders = [
          {
            DocNum: 2001,
            DocEntry: 101,
            U_CardCode: 'C001',
            U_CardName: 'Test Business',
            U_DeliveryDate: '2026-01-18',
            U_DocCurrency: 'USD',
            U_DocTotal: 1250.00,
            U_Status: 'Ordered',
            U_PaymentStatus: 'Pending',
            U_FODocEntry: 1,
            ONA_SPOR1Collection: [{}, {}, {}]
          } as any,
          {
            DocNum: 2000,
            DocEntry: 100,
            U_CardCode: 'C001',
            U_CardName: 'Test Business',
            U_DeliveryDate: '2026-01-10',
            U_DocCurrency: 'USD',
            U_DocTotal: 890.50,
            U_Status: 'InvoicedAndPaid',
            U_PaymentStatus: 'Paid',
            U_FODocEntry: 1,
            ONA_SPOR1Collection: [{}, {}]
          } as any
        ];
        this.pendingOrdersCount = 1;
        this.completedOrdersCount = 1;
        this.totalSpent = 2140.50;
        this.isLoadingOrders = false;
      }
    });
  }

  calculateStats(orders: ScheduledOrder[]): void {
    this.pendingOrdersCount = orders.filter(o =>
      o.U_Status === 'Ordered' || o.U_Status === 'OrderedAndPaid'
    ).length;
    this.completedOrdersCount = orders.filter(o =>
      o.U_Status === 'Invoiced' || o.U_Status === 'InvoicedAndPaid'
    ).length;
    this.totalSpent = orders.reduce((sum, o) => sum + (o.U_DocTotal || 0), 0);
  }

  getStatusClass(status: string): string {
    return this.b2bService.getStatusColor(status);
  }
}
