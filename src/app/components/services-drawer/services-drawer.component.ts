import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  route: string;
  color: string;
  badge?: string;
}

@Component({
  selector: 'app-services-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Overlay -->
    <div
      *ngIf="isOpen"
      class="fixed inset-0 bg-black/50 z-[1200] transition-opacity"
      (click)="close.emit()">
    </div>

    <!-- Drawer Panel -->
    <aside
      *ngIf="isOpen"
      class="fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-[1201] shadow-2xl overflow-hidden transform transition-transform duration-300"
      [class.translate-x-0]="isOpen"
      [class.translate-x-full]="!isOpen">

      <!-- Header -->
      <div class="flex items-center justify-between p-5 bg-gradient-to-r from-[#1c352c] to-[#2a4d3f] text-white">
        <div>
          <h2 class="text-lg font-bold">Other Services</h2>
          <p class="text-sm text-white/70">Pay bills & top up</p>
        </div>
        <button (click)="close.emit()" class="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>

      <!-- Services Grid -->
      <div class="p-5 overflow-y-auto h-[calc(100%-88px)]">
        <div class="grid grid-cols-2 gap-4">
          <a
            *ngFor="let service of services"
            [routerLink]="service.route"
            (click)="close.emit()"
            class="relative flex flex-col items-center p-5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-md">

            <!-- Badge -->
            <span *ngIf="service.badge" class="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  [ngClass]="{
                    'bg-green-100 text-green-700': service.badge === 'Popular',
                    'bg-blue-100 text-blue-700': service.badge === 'New',
                    'bg-orange-100 text-orange-700': service.badge === 'Soon'
                  }">
              {{ service.badge }}
            </span>

            <!-- Icon -->
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110"
                 [style.background-color]="service.color + '20'">
              {{ service.icon }}
            </div>

            <!-- Name -->
            <span class="text-sm font-semibold text-gray-800 text-center">{{ service.name }}</span>

            <!-- Description -->
            <span class="text-xs text-gray-500 text-center mt-1">{{ service.description }}</span>
          </a>
        </div>

        <!-- Coming Soon Section -->
        <div class="mt-8 p-4 bg-gradient-to-r from-[#42af57]/10 to-[#42af57]/5 rounded-2xl border border-[#42af57]/20">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-[#42af57] rounded-full flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/>
                <path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">More Services Coming</h3>
              <p class="text-sm text-gray-500">We're adding new services regularly</p>
            </div>
          </div>
          <p class="text-xs text-gray-600">Stay tuned for flight bookings, event tickets, and more!</p>
        </div>

        <!-- B2B Link -->
        <a routerLink="/b2b" (click)="close.emit()"
           class="mt-6 flex items-center gap-4 p-4 bg-[#1c352c] text-white rounded-2xl hover:bg-[#2a4d3f] transition-colors group">
          <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
            <span class="text-xl">🏢</span>
          </div>
          <div class="flex-1">
            <span class="font-semibold block">B2B Portal</span>
            <span class="text-sm text-white/70">Business ordering & schedules</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </a>
      </div>
    </aside>
  `
})
export class ServicesDrawerComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  services: ServiceCategory[] = [
    {
      id: 'airtime',
      name: 'Airtime & Data',
      icon: '📱',
      description: 'Econet, NetOne, Telecel',
      route: '/services',
      color: '#3b82f6',
      badge: 'Popular'
    },
    {
      id: 'zesa',
      name: 'ZESA Tokens',
      icon: '⚡',
      description: 'Electricity prepaid',
      route: '/services',
      color: '#f59e0b',
      badge: 'Popular'
    },
    {
      id: 'tv',
      name: 'DStv / GOtv',
      icon: '📺',
      description: 'TV subscriptions',
      route: '/services',
      color: '#8b5cf6'
    },
    {
      id: 'water',
      name: 'Water & Bills',
      icon: '💧',
      description: 'Utility payments',
      route: '/services',
      color: '#06b6d4'
    },
    {
      id: 'internet',
      name: 'Internet & WiFi',
      icon: '🌐',
      description: 'Broadband packages',
      route: '/services',
      color: '#10b981'
    },
    {
      id: 'insurance',
      name: 'Insurance',
      icon: '🛡️',
      description: 'Cover & protection',
      route: '/services',
      color: '#ef4444',
      badge: 'Soon'
    },
    {
      id: 'vouchers',
      name: 'Gift Vouchers',
      icon: '🎁',
      description: 'Gift cards & codes',
      route: '/services',
      color: '#ec4899'
    },
    {
      id: 'money',
      name: 'Money Transfer',
      icon: '💰',
      description: 'Send & receive',
      route: '/services',
      color: '#22c55e',
      badge: 'New'
    }
  ];
}
