import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Vendor {
  id?: string;
  code: string;
  name: string;
  logo: string;
  rating: number;
  since?: number;
  products: number;
  positive: number;
  orders: string;
  address: string;
  badge?: 'featured' | 'verified' | 'new';
  description: string;
  features?: string[];
  hasB2B?: boolean;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VendorsService {
  private apiUrl = environment.apiURL;

  private vendorsSubject = new BehaviorSubject<Vendor[]>([]);
  vendors$ = this.vendorsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Fetch all vendors from the API
   * In production, replace the endpoint with your actual vendors API
   */
  getVendors(limit?: number, page?: number): Observable<Vendor[]> {
    this.loadingSubject.next(true);

    // TODO: Replace with actual API endpoint when available
    // Example: return this.http.get<any>(`${this.apiUrl}Vendors?$top=${limit}&$skip=${(page - 1) * limit}`)
    //   .pipe(
    //     map(response => this.mapVendorsFromAPI(response.values)),
    //     tap(vendors => this.vendorsSubject.next(vendors)),
    //     catchError(this.handleError)
    //   );

    // Fallback: Return empty array when API is not available
    return of([]).pipe(
      tap(() => {
        this.loadingSubject.next(false);
        this.vendorsSubject.next([]);
      }),
      catchError(error => {
        console.error('Error fetching vendors:', error);
        this.loadingSubject.next(false);
        return of([]);
      })
    );
  }

  /**
   * Get active vendors only
   */
  getActiveVendors(): Observable<Vendor[]> {
    return this.getVendors().pipe(
      map(vendors => vendors.filter(v => v.isActive !== false))
    );
  }

  /**
   * Get featured vendors
   */
  getFeaturedVendors(limit: number = 4): Observable<Vendor[]> {
    return this.getVendors().pipe(
      map(vendors => vendors.filter(v => v.badge === 'featured').slice(0, limit))
    );
  }

  /**
   * Get vendor by code
   */
  getVendorByCode(code: string): Observable<Vendor | undefined> {
    // TODO: Replace with actual API call
    // return this.http.get<Vendor>(`${this.apiUrl}Vendors('${code}')`);

    return this.vendors$.pipe(
      map(vendors => vendors.find(v => v.code === code))
    );
  }

  /**
   * Map API response to Vendor interface
   * Adjust this based on your actual API response structure
   */
  private mapVendorsFromAPI(apiData: any[]): Vendor[] {
    return apiData.map(item => ({
      id: item.id || item.vendorCode,
      code: item.vendorCode || item.code,
      name: item.vendorName || item.name,
      logo: item.logo || item.logoUrl || 'assets/images/vendor-placeholder.png',
      rating: item.rating || 4.5,
      since: item.establishedYear || item.since,
      products: item.productCount || item.products || 0,
      positive: item.satisfactionRate || item.positive || 95,
      orders: item.totalOrders || item.orders || '0',
      address: item.address || item.location || '',
      badge: this.determineBadge(item),
      description: item.description || '',
      features: item.features || [],
      hasB2B: item.hasB2B || false,
      isActive: item.isActive !== false
    }));
  }

  /**
   * Determine vendor badge based on criteria
   */
  private determineBadge(vendor: any): 'featured' | 'verified' | 'new' | undefined {
    if (vendor.isFeatured) return 'featured';
    if (vendor.isVerified) return 'verified';
    if (vendor.isNew || this.isRecentVendor(vendor.since || vendor.establishedYear)) return 'new';
    return undefined;
  }

  /**
   * Check if vendor is recent (joined within last year)
   */
  private isRecentVendor(since: number): boolean {
    if (!since) return false;
    const currentYear = new Date().getFullYear();
    return (currentYear - since) <= 1;
  }

  /**
   * Error handler
   */
  private handleError(error: any): Observable<Vendor[]> {
    console.error('VendorsService error:', error);
    this.loadingSubject.next(false);
    return of([]);
  }
}
