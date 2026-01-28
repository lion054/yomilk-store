import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { ShopService } from '../../core/services/shop/shop.service';
import { Shop } from '../../core/interfaces/interfaces';

@Component({
  selector: 'app-shop-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Shop Selector Button -->
    <div class="relative">
      <button
        (click)="toggleDropdown()"
        class="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span class="max-w-[150px] truncate">{{ userAddress || activeShop?.name || 'My delivery address' }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.rotate-180]="isOpen">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      <!-- Dropdown -->
      <div
        *ngIf="isOpen"
        class="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl z-[1100] overflow-hidden border border-gray-100">

        <!-- Header with User Location -->
        <div class="p-4 bg-gradient-to-r from-[#42af57] to-[#2d7a2d]">
          <h3 class="font-bold text-white text-lg">{{ userAddress ? 'Delivering to' : 'Select Delivery Address' }}</h3>
          <p class="text-white/70 text-xs mt-1">{{ userAddress ? 'Choose a store for your order' : 'Set your location and select a store' }}</p>

          <!-- User Location Section -->
          <div class="mt-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg *ngIf="!isLoadingLocation" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>
                  <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                  <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                </svg>
                <svg *ngIf="isLoadingLocation" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] text-white/60 uppercase tracking-wide font-medium">Your Location</p>
                <p *ngIf="userAddress" class="text-white text-sm font-medium truncate">{{ userAddress }}</p>
                <p *ngIf="!userAddress && !isLoadingLocation && !locationError" class="text-white/80 text-sm">
                  <button (click)="detectLocation()" class="underline hover:no-underline">Detect my location</button>
                </p>
                <p *ngIf="isLoadingLocation" class="text-white/80 text-sm">Detecting location...</p>
                <p *ngIf="locationError && !userAddress" class="text-white/80 text-xs">{{ locationError }}</p>
              </div>
              <button
                *ngIf="userAddress || locationError"
                (click)="detectLocation()"
                class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                title="Refresh location">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M8 16H3v5"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Shop List -->
        <div class="max-h-72 overflow-y-auto">
          <button
            *ngFor="let shop of shops"
            (click)="selectShop(shop)"
            [disabled]="!shop.isActive"
            [class]="shop.id === activeShop?.id
              ? 'w-full p-4 text-left flex items-start gap-3 bg-[#42af57]/5 border-l-4 border-[#42af57]'
              : shop.isActive
                ? 'w-full p-4 text-left flex items-start gap-3 hover:bg-gray-50 border-l-4 border-transparent transition-colors'
                : 'w-full p-4 text-left flex items-start gap-3 bg-gray-100/50 opacity-60 cursor-not-allowed border-l-4 border-transparent'">

            <!-- Shop Icon -->
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                 [class]="shop.isActive ? 'bg-[#42af57]/10' : 'bg-gray-200'">
              <span *ngIf="shop.isActive">🏪</span>
              <span *ngIf="!shop.isActive">🔒</span>
            </div>

            <!-- Shop Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-900 truncate">{{ shop.name }}</span>
                <span *ngIf="shop.badge === 'featured'" class="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">Featured</span>
                <span *ngIf="shop.badge === 'new'" class="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">Coming Soon</span>
              </div>
              <p class="text-xs text-gray-500 truncate mt-0.5">{{ shop.address }}</p>

              <!-- Status & Distance -->
              <div class="flex items-center gap-3 mt-2">
                <span *ngIf="shop.isActive && isShopOpen(shop)" class="flex items-center gap-1 text-xs text-green-600">
                  <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Open now
                </span>
                <span *ngIf="shop.isActive && !isShopOpen(shop)" class="flex items-center gap-1 text-xs text-red-500">
                  <span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Closed
                </span>
                <span *ngIf="shop.rating" class="flex items-center gap-1 text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {{ shop.rating }}
                </span>
                <span *ngIf="userCoords && shop.coordinates" class="text-xs text-gray-400">
                  ~{{ calculateDistance(shop) }} km
                </span>
              </div>
            </div>

            <!-- Selected Checkmark -->
            <div *ngIf="shop.id === activeShop?.id" class="w-6 h-6 bg-[#42af57] rounded-full flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </button>
        </div>

        <!-- Footer -->
        <div class="p-3 bg-gray-50 border-t border-gray-100">
          <p class="text-xs text-gray-500 text-center">
            Can't find your area? <a href="/contact-us" class="text-[#42af57] hover:underline">Contact us</a>
          </p>
        </div>
      </div>

      <!-- Backdrop -->
      <div
        *ngIf="isOpen"
        class="fixed inset-0 z-[1099]"
        (click)="isOpen = false">
      </div>
    </div>
  `
})
export class ShopSelectorComponent implements OnInit, OnDestroy {
  isOpen = false;
  activeShop: Shop | null = null;
  shops: Shop[] = [];
  private destroy$ = new Subject<void>();

  // Location state
  userAddress: string = '';
  userCoords: { lat: number; lng: number } | null = null;
  isLoadingLocation = false;
  locationError: string = '';

  constructor(
    private shopService: ShopService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.shopService.activeShop$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(shop => {
      this.activeShop = shop;
    });

    this.shopService.getShops().pipe(
      takeUntil(this.destroy$)
    ).subscribe(shops => {
      this.shops = shops;
    });

    // Try to load saved address from localStorage
    const savedAddress = localStorage.getItem('userAddress');
    const savedCoords = localStorage.getItem('userCoords');
    if (savedAddress) {
      this.userAddress = savedAddress;
    }
    if (savedCoords) {
      this.userCoords = JSON.parse(savedCoords);
    }
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectShop(shop: Shop) {
    if (shop.isActive) {
      this.shopService.setActiveShop(shop);
      this.isOpen = false;
    }
  }

  isShopOpen(shop: Shop): boolean {
    return this.shopService.isShopOpen(shop);
  }

  detectLocation() {
    if (!navigator.geolocation) {
      this.locationError = 'Geolocation not supported';
      return;
    }

    this.isLoadingLocation = true;
    this.locationError = '';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        localStorage.setItem('userCoords', JSON.stringify(this.userCoords));
        this.reverseGeocode(this.userCoords.lat, this.userCoords.lng);
      },
      (error) => {
        this.isLoadingLocation = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError = 'Location unavailable';
            break;
          case error.TIMEOUT:
            this.locationError = 'Location request timed out';
            break;
          default:
            this.locationError = 'Unable to get location';
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  }

  private reverseGeocode(lat: number, lng: number) {
    // Using OpenStreetMap Nominatim (free, open source)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

    this.http.get<any>(url, {
      headers: {
        'Accept-Language': 'en'
      }
    }).pipe(
      catchError(error => {
        console.error('Geocoding error:', error);
        return of(null);
      })
    ).subscribe(result => {
      this.isLoadingLocation = false;

      if (result && result.address) {
        // Build a readable address
        const addr = result.address;
        const parts = [];

        // Try to get suburb/neighborhood first
        if (addr.suburb) parts.push(addr.suburb);
        else if (addr.neighbourhood) parts.push(addr.neighbourhood);
        else if (addr.residential) parts.push(addr.residential);

        // Add city/town
        if (addr.city) parts.push(addr.city);
        else if (addr.town) parts.push(addr.town);
        else if (addr.village) parts.push(addr.village);

        // Add country for context
        if (addr.country && parts.length < 2) parts.push(addr.country);

        this.userAddress = parts.length > 0 ? parts.join(', ') : result.display_name?.split(',').slice(0, 2).join(',');
        localStorage.setItem('userAddress', this.userAddress);
      } else {
        this.locationError = 'Could not determine address';
      }
    });
  }

  calculateDistance(shop: Shop): string {
    if (!this.userCoords || !shop.coordinates) return '';

    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(shop.coordinates.lat - this.userCoords.lat);
    const dLon = this.toRad(shop.coordinates.lng - this.userCoords.lng);
    const lat1 = this.toRad(this.userCoords.lat);
    const lat2 = this.toRad(shop.coordinates.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(1);
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
