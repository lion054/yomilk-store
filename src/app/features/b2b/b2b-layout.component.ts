import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-b2b-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Top Header -->
      <header class="bg-[#1c352c] text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <div class="flex items-center gap-3">
              <img src="logo.png" alt="Snappy Fresh" class="h-10 brightness-0 invert" />
              <div class="hidden sm:block">
                <span class="text-xs bg-[#42af57] px-2 py-1 rounded-full font-medium">Business Portal</span>
              </div>
            </div>

            <!-- Right Section -->
            <div class="flex items-center gap-4">
              <!-- Notifications -->
              <button class="relative p-2 text-gray-300 hover:text-white transition-colors">
                <i class="fas fa-bell text-lg"></i>
                <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <!-- User Menu -->
              <div class="flex items-center gap-3">
                <div class="hidden md:block text-right">
                  <p class="text-sm font-medium">{{ userName }}</p>
                  <p class="text-xs text-gray-400">{{ companyName }}</p>
                </div>
                <div class="w-10 h-10 bg-[#42af57] rounded-full flex items-center justify-center font-semibold">
                  {{ userInitials }}
                </div>
                <button
                  (click)="logout()"
                  class="text-gray-300 hover:text-white p-2 transition-colors"
                  title="Logout"
                >
                  <i class="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="flex">
        <!-- Sidebar -->
        <aside class="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
          <nav class="p-4 space-y-1">
            <a
              routerLink="/b2b/dashboard"
              routerLinkActive="bg-[#42af57]/10 text-[#42af57] border-r-2 border-[#42af57]"
              class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-th-large w-5"></i>
              <span class="font-medium">Dashboard</span>
            </a>
            <a
              routerLink="/b2b/schedules"
              routerLinkActive="bg-[#42af57]/10 text-[#42af57] border-r-2 border-[#42af57]"
              class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-calendar-alt w-5"></i>
              <span class="font-medium">Order Schedules</span>
            </a>
            <a
              routerLink="/b2b/new-order"
              routerLinkActive="bg-[#42af57]/10 text-[#42af57] border-r-2 border-[#42af57]"
              class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-plus-circle w-5"></i>
              <span class="font-medium">New Order</span>
            </a>
            <a
              routerLink="/b2b/orders"
              routerLinkActive="bg-[#42af57]/10 text-[#42af57] border-r-2 border-[#42af57]"
              class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-shopping-bag w-5"></i>
              <span class="font-medium">My Orders</span>
            </a>
            <a
              routerLink="/b2b/account"
              routerLinkActive="bg-[#42af57]/10 text-[#42af57] border-r-2 border-[#42af57]"
              class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="fas fa-user-circle w-5"></i>
              <span class="font-medium">My Account</span>
            </a>

            <div class="pt-4 mt-4 border-t border-gray-200">
              <a
                routerLink="/b2b/settings"
                routerLinkActive="bg-[#42af57]/10 text-[#42af57]"
                class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i class="fas fa-cog w-5"></i>
                <span class="font-medium">Settings</span>
              </a>
              <a
                href="mailto:support@snappyfresh.net"
                class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i class="fas fa-headset w-5"></i>
                <span class="font-medium">Support</span>
              </a>
            </div>
          </nav>
        </aside>

        <!-- Mobile Bottom Navigation -->
        <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div class="flex items-center justify-around py-2">
            <a routerLink="/b2b/dashboard" routerLinkActive="text-[#42af57]" class="flex flex-col items-center gap-1 p-2 text-gray-600">
              <i class="fas fa-th-large text-lg"></i>
              <span class="text-xs">Dashboard</span>
            </a>
            <a routerLink="/b2b/schedules" routerLinkActive="text-[#42af57]" class="flex flex-col items-center gap-1 p-2 text-gray-600">
              <i class="fas fa-calendar-alt text-lg"></i>
              <span class="text-xs">Schedules</span>
            </a>
            <a routerLink="/b2b/new-order" routerLinkActive="text-[#42af57]" class="flex flex-col items-center gap-1 p-2 text-gray-600">
              <i class="fas fa-plus-circle text-xl text-[#42af57]"></i>
              <span class="text-xs">New Order</span>
            </a>
            <a routerLink="/b2b/orders" routerLinkActive="text-[#42af57]" class="flex flex-col items-center gap-1 p-2 text-gray-600">
              <i class="fas fa-shopping-bag text-lg"></i>
              <span class="text-xs">Orders</span>
            </a>
            <a routerLink="/b2b/account" routerLinkActive="text-[#42af57]" class="flex flex-col items-center gap-1 p-2 text-gray-600">
              <i class="fas fa-user-circle text-lg"></i>
              <span class="text-xs">Account</span>
            </a>
          </div>
        </nav>

        <!-- Main Content -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class B2bLayoutComponent implements OnInit {
  userName = 'Business User';
  companyName = 'Company Name';
  userInitials = 'BU';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getAuthUser();
    if (user) {
      this.userName = user.customer?.cardName || user.userName || 'Business User';
      this.companyName = user.companyName || 'Snappy Fresh Partner';
      this.userInitials = this.getInitials(this.userName);
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
