import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-b2b-settings',
  standalone: true,
  imports: [RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p class="text-gray-500 mt-1">Manage your business account and preferences</p>
      </div>

      <!-- Profile Card -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="bg-gradient-to-r from-[#1c352c] to-[#2d5241] p-6">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 bg-[#42af57] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {{ userInitials }}
            </div>
            <div class="text-white">
              <h2 class="text-xl font-semibold">{{ cardName }}</h2>
              <p class="text-white/70">{{ cardCode }}</p>
              <p class="text-sm text-white/60">{{ companyName }}</p>
            </div>
          </div>
        </div>

        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p class="text-sm text-gray-500 mb-1">Email</p>
            <p class="font-medium text-gray-900">{{ email || 'Not set' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Currency</p>
            <p class="font-medium text-gray-900">{{ currency }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Warehouse</p>
            <p class="font-medium text-gray-900">{{ warehouseName }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Account Status</p>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              Active
            </span>
          </div>
        </div>
      </div>

      <!-- Settings Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Notification Settings -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-5 border-b border-gray-100">
            <h3 class="font-semibold text-gray-900">
              <i class="fas fa-bell text-[#42af57] mr-2"></i>
              Notification Preferences
            </h3>
          </div>
          <div class="p-5 space-y-4">
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="font-medium text-gray-900">Order Confirmations</p>
                <p class="text-sm text-gray-500">Receive email when orders are confirmed</p>
              </div>
              <input type="checkbox" [(ngModel)]="notifications.orderConfirmations" class="toggle-checkbox" />
            </label>
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="font-medium text-gray-900">Delivery Updates</p>
                <p class="text-sm text-gray-500">Get notified about delivery status</p>
              </div>
              <input type="checkbox" [(ngModel)]="notifications.deliveryUpdates" class="toggle-checkbox" />
            </label>
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="font-medium text-gray-900">Schedule Reminders</p>
                <p class="text-sm text-gray-500">Reminders before schedule deadlines</p>
              </div>
              <input type="checkbox" [(ngModel)]="notifications.scheduleReminders" class="toggle-checkbox" />
            </label>
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="font-medium text-gray-900">Invoice Notifications</p>
                <p class="text-sm text-gray-500">Notifications when invoices are ready</p>
              </div>
              <input type="checkbox" [(ngModel)]="notifications.invoiceNotifications" class="toggle-checkbox" />
            </label>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="p-5 border-b border-gray-100">
            <h3 class="font-semibold text-gray-900">
              <i class="fas fa-shield-alt text-[#42af57] mr-2"></i>
              Security
            </h3>
          </div>
          <div class="p-5 space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p class="font-medium text-gray-900">Password</p>
                <p class="text-sm text-gray-500">Last changed 30 days ago</p>
              </div>
              <button class="text-[#42af57] font-medium hover:underline">
                Change
              </button>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p class="font-medium text-gray-900">Two-Factor Authentication</p>
                <p class="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <span class="text-sm text-gray-500">Coming Soon</span>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p class="font-medium text-gray-900">Active Sessions</p>
                <p class="text-sm text-gray-500">Manage your logged in devices</p>
              </div>
              <button class="text-[#42af57] font-medium hover:underline">
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="font-semibold text-gray-900 mb-4">
          <i class="fas fa-link text-[#42af57] mr-2"></i>
          Quick Links
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <a
            href="mailto:support@snappyfresh.net"
            class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-[#42af57]/10 transition-colors"
          >
            <i class="fas fa-headset text-[#42af57] text-xl"></i>
            <span class="font-medium text-gray-900">Contact Support</span>
          </a>
          <a
            routerLink="/b2b/orders"
            class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-[#42af57]/10 transition-colors"
          >
            <i class="fas fa-file-invoice text-[#42af57] text-xl"></i>
            <span class="font-medium text-gray-900">View Invoices</span>
          </a>
          <a
            href="#"
            class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-[#42af57]/10 transition-colors"
          >
            <i class="fas fa-file-contract text-[#42af57] text-xl"></i>
            <span class="font-medium text-gray-900">Terms of Service</span>
          </a>
          <a
            href="#"
            class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-[#42af57]/10 transition-colors"
          >
            <i class="fas fa-question-circle text-[#42af57] text-xl"></i>
            <span class="font-medium text-gray-900">Help Center</span>
          </a>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-white rounded-xl border border-red-200 overflow-hidden">
        <div class="p-5 border-b border-red-100 bg-red-50">
          <h3 class="font-semibold text-red-700">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            Danger Zone
          </h3>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Sign Out</p>
              <p class="text-sm text-gray-500">Sign out of your business account</p>
            </div>
            <button
              (click)="logout()"
              class="px-5 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toggle-checkbox {
      appearance: none;
      width: 48px;
      height: 24px;
      background: #e5e7eb;
      border-radius: 12px;
      position: relative;
      cursor: pointer;
      transition: all 0.3s;
    }
    .toggle-checkbox:checked {
      background: #42af57;
    }
    .toggle-checkbox::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: all 0.3s;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .toggle-checkbox:checked::after {
      left: 26px;
    }
  `]
})
export class B2bSettingsComponent implements OnInit {
  cardName = 'Business Partner';
  cardCode = 'BP001';
  companyName = 'Snappy Fresh Partner';
  email = '';
  currency = 'USD';
  warehouseName = 'Main Warehouse';
  userInitials = 'BP';

  notifications = {
    orderConfirmations: true,
    deliveryUpdates: true,
    scheduleReminders: true,
    invoiceNotifications: true
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getAuthUser();
    if (user) {
      this.cardName = user.customer?.cardName || user.userName || 'Business Partner';
      this.cardCode = user.customer?.cardCode || user.userCode || 'BP001';
      this.companyName = user.companyName || 'Snappy Fresh Partner';
      this.currency = user.customer?.currency || 'USD';
      this.warehouseName = user.customer?.warehouseName || user.warehouseName || 'Main Warehouse';
      this.userInitials = this.getInitials(this.cardName);
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout(): void {
    this.authService.logOut();
  }
}
