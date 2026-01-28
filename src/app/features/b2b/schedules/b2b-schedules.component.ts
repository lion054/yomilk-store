import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { B2bService, StoreOrderSchedule } from '../../../core/services/b2b/b2b.service';

@Component({
  selector: 'app-b2b-schedules',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Order Schedules</h1>
          <p class="text-gray-500 mt-1">View available schedules and place your orders</p>
        </div>
        <a
          routerLink="/b2b/new-order"
          class="inline-flex items-center justify-center gap-2 bg-[#42af57] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#3d9332] transition-all"
        >
          <i class="fas fa-plus"></i>
          New Order
        </a>
      </div>

      <!-- Filter Tabs -->
      <div class="bg-white rounded-xl border border-gray-200 p-2 flex gap-2">
        <button
          *ngFor="let filter of filters"
          (click)="activeFilter = filter.value"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          [ngClass]="activeFilter === filter.value ? 'bg-[#42af57] text-white' : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ filter.label }}
          <span
            *ngIf="filter.count > 0"
            class="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
            [ngClass]="activeFilter === filter.value ? 'bg-white/20' : 'bg-gray-200'"
          >
            {{ filter.count }}
          </span>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div *ngFor="let i of [1,2,3,4]" class="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-4 bg-gray-100 rounded w-2/3 mb-3"></div>
          <div class="h-4 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredSchedules.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-calendar-times text-gray-400 text-3xl"></i>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No schedules found</h3>
        <p class="text-gray-500 mb-6">There are no {{ activeFilter !== 'all' ? activeFilter : '' }} schedules available at the moment.</p>
        <button
          (click)="activeFilter = 'all'"
          *ngIf="activeFilter !== 'all'"
          class="text-[#42af57] font-medium hover:underline"
        >
          View all schedules
        </button>
      </div>

      <!-- Schedules Grid -->
      <div *ngIf="!isLoading && filteredSchedules.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          *ngFor="let schedule of filteredSchedules"
          class="bg-white rounded-xl border-2 border-gray-200 hover:border-[#42af57] transition-all overflow-hidden"
        >
          <!-- Schedule Header -->
          <div class="p-5 border-b border-gray-100">
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-semibold text-gray-900">Schedule #{{ schedule.DocNum }}</h3>
                  <span
                    class="text-xs px-2.5 py-1 rounded-full font-medium"
                    [ngClass]="getStatusClass(schedule.Status)"
                  >
                    {{ schedule.Status }}
                  </span>
                </div>
                <p class="text-gray-500 text-sm mt-1">{{ schedule.Remark || 'Order Schedule' }}</p>
              </div>
              <div class="text-right">
                <span class="text-xs text-gray-400">DocEntry</span>
                <p class="font-mono text-sm text-gray-600">{{ schedule.DocEntry }}</p>
              </div>
            </div>
          </div>

          <!-- Schedule Details -->
          <div class="p-5 space-y-4">
            <!-- Date Range -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-calendar text-blue-600"></i>
              </div>
              <div>
                <p class="text-xs text-gray-500">Order Window</p>
                <p class="font-medium text-gray-900">
                  {{ schedule.StartDate | date:'MMM d' }} - {{ schedule.EndDate | date:'MMM d, yyyy' }}
                </p>
              </div>
            </div>

            <!-- Delivery Range -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-truck text-green-600"></i>
              </div>
              <div>
                <p class="text-xs text-gray-500">Delivery Window</p>
                <p class="font-medium text-gray-900">
                  {{ schedule.StartDeliveryDate | date:'MMM d' }} - {{ schedule.EndDeliveryDate | date:'MMM d, yyyy' }}
                </p>
              </div>
            </div>

            <!-- Available Dates -->
            <div>
              <p class="text-xs text-gray-500 mb-2">Available Delivery Dates</p>
              <div class="flex flex-wrap gap-2">
                <span
                  *ngFor="let date of schedule.AvailableDeliveryDates?.slice(0, 5)"
                  class="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg"
                >
                  {{ date | date:'EEE, MMM d' }}
                </span>
                <span
                  *ngIf="schedule.AvailableDeliveryDates && schedule.AvailableDeliveryDates.length > 5"
                  class="text-xs px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg"
                >
                  +{{ schedule.AvailableDeliveryDates.length - 5 }} more
                </span>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="p-5 pt-0">
            <a
              [routerLink]="['/b2b/new-order']"
              [queryParams]="{ schedule: schedule.DocEntry }"
              class="w-full inline-flex items-center justify-center gap-2 bg-[#42af57] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#3d9332] transition-all"
              [class.opacity-50]="schedule.Status !== 'Open'"
              [class.pointer-events-none]="schedule.Status !== 'Open'"
            >
              <i class="fas fa-shopping-cart"></i>
              {{ schedule.Status === 'Open' ? 'Create Order' : 'Schedule Closed' }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class B2bSchedulesComponent implements OnInit {
  schedules: StoreOrderSchedule[] = [];
  isLoading = true;
  activeFilter = 'all';

  filters = [
    { label: 'All Schedules', value: 'all', count: 0 },
    { label: 'Open', value: 'Open', count: 0 },
    { label: 'Closed', value: 'Closed', count: 0 },
    { label: 'Invoiced', value: 'Invoiced', count: 0 }
  ];

  constructor(private b2bService: B2bService) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.isLoading = true;
    this.b2bService.getAvailableSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules;
        this.updateFilterCounts();
        this.isLoading = false;
      },
      error: () => {
        // Mock data for presentation
        this.schedules = [
          {
            DocEntry: 1,
            DocNum: 1001,
            Remark: 'Weekly Dairy Products Order',
            StartDate: '2026-01-13T00:00:00',
            EndDate: '2026-01-20T00:00:00',
            StartDeliveryDate: '2026-01-15T00:00:00',
            EndDeliveryDate: '2026-01-19T00:00:00',
            Status: 'Open',
            AvailableDeliveryDates: [
              '2026-01-15T00:00:00',
              '2026-01-16T00:00:00',
              '2026-01-17T00:00:00',
              '2026-01-18T00:00:00',
              '2026-01-19T00:00:00'
            ]
          },
          {
            DocEntry: 2,
            DocNum: 1002,
            Remark: 'Monthly Bulk Stock Order',
            StartDate: '2026-01-15T00:00:00',
            EndDate: '2026-01-31T00:00:00',
            StartDeliveryDate: '2026-01-17T00:00:00',
            EndDeliveryDate: '2026-01-30T00:00:00',
            Status: 'Open',
            AvailableDeliveryDates: [
              '2026-01-17T00:00:00',
              '2026-01-20T00:00:00',
              '2026-01-22T00:00:00',
              '2026-01-24T00:00:00',
              '2026-01-27T00:00:00',
              '2026-01-29T00:00:00',
              '2026-01-30T00:00:00'
            ]
          },
          {
            DocEntry: 3,
            DocNum: 1000,
            Remark: 'January Week 1 Order',
            StartDate: '2026-01-01T00:00:00',
            EndDate: '2026-01-07T00:00:00',
            StartDeliveryDate: '2026-01-03T00:00:00',
            EndDeliveryDate: '2026-01-06T00:00:00',
            Status: 'Closed',
            AvailableDeliveryDates: []
          },
          {
            DocEntry: 4,
            DocNum: 999,
            Remark: 'December Holiday Order',
            StartDate: '2025-12-20T00:00:00',
            EndDate: '2025-12-28T00:00:00',
            StartDeliveryDate: '2025-12-22T00:00:00',
            EndDeliveryDate: '2025-12-27T00:00:00',
            Status: 'Invoiced',
            AvailableDeliveryDates: []
          }
        ];
        this.updateFilterCounts();
        this.isLoading = false;
      }
    });
  }

  updateFilterCounts(): void {
    this.filters[0].count = this.schedules.length;
    this.filters[1].count = this.schedules.filter(s => s.Status === 'Open').length;
    this.filters[2].count = this.schedules.filter(s => s.Status === 'Closed').length;
    this.filters[3].count = this.schedules.filter(s => s.Status === 'Invoiced').length;
  }

  get filteredSchedules(): StoreOrderSchedule[] {
    if (this.activeFilter === 'all') {
      return this.schedules;
    }
    return this.schedules.filter(s => s.Status === this.activeFilter);
  }

  getStatusClass(status: string): string {
    return this.b2bService.getStatusColor(status);
  }
}
