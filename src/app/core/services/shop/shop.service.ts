import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError, map } from 'rxjs';
import { Shop } from '../../interfaces/interfaces';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = environment.apiURL;

  // Active shop state
  private activeShopSubject = new BehaviorSubject<Shop | null>(null);
  activeShop$ = this.activeShopSubject.asObservable();

  // All shops
  private shopsSubject = new BehaviorSubject<Shop[]>([]);
  shops$ = this.shopsSubject.asObservable();

  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadShopsAndRestoreSelection();
  }

  private loadShopsAndRestoreSelection(): void {
    // Load shops from API first
    this.getShops().subscribe(shops => {
      // Then try to restore saved shop
      const storedShopId = localStorage.getItem('activeShopId');
      if (storedShopId && shops.length > 0) {
        const shop = shops.find(s => s.id === storedShopId);
        if (shop && shop.isActive) {
          this.activeShopSubject.next(shop);
          return;
        }
      }

      // If no saved shop or not found, default to first active shop
      if (!this.activeShopSubject.value && shops.length > 0) {
        const defaultShop = shops.find(s => s.isActive);
        if (defaultShop) {
          this.setActiveShop(defaultShop);
        }
      }
    });
  }

  getShops(): Observable<Shop[]> {
    this.loadingSubject.next(true);

    // TODO: Replace with your actual Shops API endpoint
    // Example: return this.http.get<any>(`${this.apiUrl}Shops`).pipe(
    //   map(response => this.mapShopsFromAPI(response.values || response)),
    //   tap(shops => {
    //     this.shopsSubject.next(shops);
    //     this.loadingSubject.next(false);
    //   }),
    //   catchError(error => this.handleError(error))
    // );

    // When API is not available, return empty array
    return of([]).pipe(
      tap(shops => {
        this.shopsSubject.next(shops);
        this.loadingSubject.next(false);
      }),
      catchError(error => this.handleError(error))
    );
  }

  getActiveShops(): Observable<Shop[]> {
    return this.shops$.pipe(
      map(shops => shops.filter(s => s.isActive))
    );
  }

  getShopById(id: string): Observable<Shop | undefined> {
    // TODO: Replace with API call when available
    // return this.http.get<Shop>(`${this.apiUrl}Shops('${id}')`);

    return this.shops$.pipe(
      map(shops => shops.find(s => s.id === id))
    );
  }

  getShopByCode(code: string): Observable<Shop | undefined> {
    // TODO: Replace with API call when available
    // return this.http.get<Shop>(`${this.apiUrl}Shops?$filter=code eq '${code}'`);

    return this.shops$.pipe(
      map(shops => shops.find(s => s.code === code))
    );
  }

  setActiveShop(shop: Shop): void {
    this.activeShopSubject.next(shop);
    localStorage.setItem('activeShopId', shop.id);
  }

  getActiveShop(): Shop | null {
    return this.activeShopSubject.value;
  }

  clearActiveShop(): void {
    this.activeShopSubject.next(null);
    localStorage.removeItem('activeShopId');
  }

  isShopOpen(shop: Shop): boolean {
    if (!shop.operatingHours || shop.operatingHours.length === 0) return false;

    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = dayNames[now.getDay()];

    const todayHours = shop.operatingHours.find(h => h.day === today);
    if (!todayHours) return false;

    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(todayHours.open.replace(':', ''));
    const closeTime = parseInt(todayHours.close.replace(':', ''));

    return currentTime >= openTime && currentTime <= closeTime;
  }

  getDeliveryFee(shop: Shop, suburb: string): number {
    if (!shop.deliveryAreas) return -1;

    const area = shop.deliveryAreas.find(a =>
      a.name.toLowerCase() === suburb.toLowerCase()
    );
    return area ? area.fee : -1; // -1 indicates area not covered
  }

  isDeliveryAvailable(shop: Shop, suburb: string): boolean {
    return this.getDeliveryFee(shop, suburb) >= 0;
  }

  /**
   * Map API response to Shop interface
   * Adjust based on your actual API response structure
   */
  private mapShopsFromAPI(apiData: any[]): Shop[] {
    return apiData.map(item => ({
      id: item.id || item.shopId || item.code,
      code: item.code || item.shopCode,
      name: item.name || item.shopName,
      logo: item.logo || item.logoUrl || 'logo.png',
      description: item.description || '',
      address: item.address || '',
      coordinates: item.coordinates || item.location,
      operatingHours: this.parseOperatingHours(item.operatingHours || item.hours),
      deliveryAreas: this.parseDeliveryAreas(item.deliveryAreas || item.areas),
      isActive: item.isActive !== false,
      rating: item.rating || 0,
      badge: this.determineBadge(item),
      categories: item.categories || []
    }));
  }

  private parseOperatingHours(hours: any): Array<{day: string, open: string, close: string}> {
    if (!hours) return [];
    if (Array.isArray(hours)) return hours;

    // Parse if it's an object with day keys
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return dayOrder.map(day => ({
      day,
      open: hours[day]?.open || '09:00',
      close: hours[day]?.close || '17:00'
    })).filter(h => hours[h.day]);
  }

  private parseDeliveryAreas(areas: any): Array<{name: string, fee: number, minOrder: number}> {
    if (!areas) return [];
    if (Array.isArray(areas)) return areas;
    return [];
  }

  private determineBadge(shop: any): 'featured' | 'verified' | 'new' | undefined {
    if (shop.isFeatured || shop.badge === 'featured') return 'featured';
    if (shop.isVerified || shop.badge === 'verified') return 'verified';
    if (shop.isNew || shop.badge === 'new') return 'new';
    return undefined;
  }

  private handleError(error: any): Observable<Shop[]> {
    console.error('ShopService error:', error);
    this.loadingSubject.next(false);
    this.shopsSubject.next([]);
    return of([]);
  }
}
