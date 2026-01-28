import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { StoreService } from '../../core/services/store/store.service';

interface Category {
  number: number;
  groupName: string;
  emoji?: string;
}

@Component({
  selector: 'app-mega-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Overlay -->
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-[999]"
      (click)="close.emit()">
    </div>

    <!-- Mega Menu Panel -->
    <div
      *ngIf="isOpen"
      class="absolute top-full left-0 right-0 bg-white shadow-2xl z-[1000] border-t border-gray-100 animate-fadeIn"
      (mouseenter)="keepOpen()"
      (mouseleave)="startClose()">
      <div class="container mx-auto px-6 py-8">
        <div class="grid grid-cols-12 gap-8">

          <!-- Categories Column -->
          <div class="col-span-8">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Shop by Category</h3>

            <!-- Loading -->
            <div *ngIf="isLoading" class="grid grid-cols-4 gap-4">
              <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="animate-pulse">
                <div class="flex items-center gap-3 p-3 rounded-xl bg-gray-100">
                  <div class="w-12 h-12 rounded-xl bg-gray-200"></div>
                  <div class="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>

            <!-- Categories Grid -->
            <div *ngIf="!isLoading" class="grid grid-cols-4 gap-3">
              <!-- All Products -->
              <a
                routerLink="/store"
                (click)="close.emit()"
                class="flex items-center gap-3 p-3 rounded-xl bg-[#42af57] text-white hover:bg-[#3a9a4d] transition-all group">
                <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                  🛒
                </div>
                <div>
                  <span class="font-semibold text-sm">All Products</span>
                  <span class="block text-xs text-white/70">Browse everything</span>
                </div>
              </a>

              <!-- Dynamic Categories -->
              <a
                *ngFor="let category of categories"
                [routerLink]="['/store']"
                [queryParams]="{group: category.number}"
                (click)="close.emit()"
                class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group border border-transparent hover:border-gray-200">
                <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                  {{ getCategoryEmoji(category.groupName) }}
                </div>
                <div>
                  <span class="font-semibold text-sm text-gray-800 group-hover:text-[#42af57] transition-colors">{{ category.groupName }}</span>
                </div>
              </a>
            </div>
          </div>

          <!-- Featured / Promo Column -->
          <div class="col-span-4">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Featured</h3>

            <!-- Promo Cards -->
            <div class="space-y-4">
              <!-- Leaflets Promo -->
              <a routerLink="/leaflets" (click)="close.emit()" class="block p-5 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 hover:from-orange-200 hover:to-orange-100 transition-all group">
                <div class="flex items-start gap-4">
                  <div class="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-3xl shadow-sm">
                    📰
                  </div>
                  <div>
                    <span class="font-bold text-gray-900 block group-hover:text-orange-700 transition-colors">Leaflets & Specials</span>
                    <span class="text-sm text-gray-600">View this week's deals</span>
                    <span class="flex items-center gap-1 text-xs font-semibold text-orange-600 mt-2 group-hover:gap-2 transition-all">
                      Browse Now
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </span>
                  </div>
                </div>
              </a>

              <!-- B2B Promo -->
              <a routerLink="/b2b" (click)="close.emit()" class="block p-5 rounded-2xl bg-gradient-to-br from-[#1c352c]/10 to-[#1c352c]/5 hover:from-[#1c352c]/20 hover:to-[#1c352c]/10 transition-all group">
                <div class="flex items-start gap-4">
                  <div class="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-3xl shadow-sm">
                    🏢
                  </div>
                  <div>
                    <span class="font-bold text-gray-900 block group-hover:text-[#1c352c] transition-colors">Business Orders</span>
                    <span class="text-sm text-gray-600">B2B portal for bulk buying</span>
                    <span class="flex items-center gap-1 text-xs font-semibold text-[#42af57] mt-2 group-hover:gap-2 transition-all">
                      Access Portal
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </span>
                  </div>
                </div>
              </a>

              <!-- Quick Links -->
              <div class="pt-4 border-t border-gray-200">
                <h4 class="text-xs font-semibold text-gray-400 uppercase mb-3">Quick Links</h4>
                <div class="grid grid-cols-2 gap-2">
                  <a routerLink="/wishlist" (click)="close.emit()" class="text-sm text-gray-600 hover:text-[#42af57] transition-colors flex items-center gap-2">
                    <span class="text-base">❤️</span> Wishlist
                  </a>
                  <a routerLink="/check-order" (click)="close.emit()" class="text-sm text-gray-600 hover:text-[#42af57] transition-colors flex items-center gap-2">
                    <span class="text-base">📦</span> Track Order
                  </a>
                  <a routerLink="/services" (click)="close.emit()" class="text-sm text-gray-600 hover:text-[#42af57] transition-colors flex items-center gap-2">
                    <span class="text-base">🔌</span> Services
                  </a>
                  <a routerLink="/contact-us" (click)="close.emit()" class="text-sm text-gray-600 hover:text-[#42af57] transition-colors flex items-center gap-2">
                    <span class="text-base">📞</span> Contact
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
  `]
})
export class MegaMenuComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  categories: Category[] = [];
  isLoading = false;
  private closeTimeout: any;
  private destroy$ = new Subject<void>();

  // Category emoji mapping
  private categoryEmojis: { [key: string]: string } = {
    'FRUITS': '🍎',
    'VEGETABLES': '🥬',
    'DAIRY': '🥛',
    'MILK': '🥛',
    'FRESH MILK': '🥛',
    'MEAT': '🥩',
    'SEAFOOD': '🐟',
    'BREAD': '🍞',
    'BAKERY': '🍞',
    'BEVERAGES': '🥤',
    'SNACKS': '🍿',
    'FROZEN': '❄️',
    'PERSONAL CARE': '🧴',
    'HOUSEHOLD': '🏠',
    'HOMECARE': '🏠',
    'GROCERY': '🛒',
    'CONDIMENTS': '🧂',
    'CANNED': '🥫',
    'CEREALS': '🥣',
    'BABY': '👶',
    'PET': '🐕',
    'PETCARE': '🐕',
    'CHEESE': '🧀',
    'CREAM': '🍦',
    'FRESH CREAM': '🍦',
    'YOGHURT': '🥄',
    'YOGURT': '🥄',
    'YOLAC': '🥛',
    'PANTRY': '🥫',
    'LIFE': '💊',
    'DEFAULT': '📦'
  };

  constructor(private storeService: StoreService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.storeService.getItemGroups(50, 1, '', '').pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
        return of({ values: [] });
      })
    ).subscribe((response: any) => {
      // Ensure we get an array, not a function
      if (Array.isArray(response.values)) {
        this.categories = response.values;
      } else if (Array.isArray(response)) {
        this.categories = response;
      } else {
        this.categories = [];
      }
      this.isLoading = false;
    });
  }

  getCategoryEmoji(categoryName: string): string {
    const upperName = categoryName?.toUpperCase() || '';
    for (const key of Object.keys(this.categoryEmojis)) {
      if (upperName.includes(key)) {
        return this.categoryEmojis[key];
      }
    }
    return this.categoryEmojis['DEFAULT'];
  }

  keepOpen() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
  }

  startClose() {
    this.closeTimeout = setTimeout(() => {
      this.close.emit();
    }, 300);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
  }
}
