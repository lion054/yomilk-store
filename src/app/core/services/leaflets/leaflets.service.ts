import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError, map, tap } from 'rxjs';
import { Leaflet } from '../../interfaces/interfaces';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeafletsService {
  private apiUrl = environment.apiURL;
  private leafletsSubject = new BehaviorSubject<Leaflet[]>([]);
  leaflets$ = this.leafletsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getLeaflets(): Observable<Leaflet[]> {
    // TODO: Replace with your actual Leaflets/Promotions API endpoint
    // Example: return this.http.get<any>(`${this.apiUrl}Leaflets`).pipe(
    //   map(response => this.mapLeafletsFromAPI(response.values || response)),
    //   tap(leaflets => this.leafletsSubject.next(leaflets)),
    //   catchError(error => this.handleError(error))
    // );

    // When API is not available, return empty array
    return of([]).pipe(
      tap(leaflets => this.leafletsSubject.next(leaflets)),
      catchError(error => this.handleError(error))
    );
  }

  getActiveLeaflets(): Observable<Leaflet[]> {
    return this.getLeaflets().pipe(
      map(leaflets => leaflets.filter(l => l.isActive && this.isLeafletValid(l)))
    );
  }

  getLeafletsByCategory(category: string): Observable<Leaflet[]> {
    return this.getLeaflets().pipe(
      map(leaflets => leaflets.filter(l => l.category === category))
    );
  }

  getLeafletById(id: string): Observable<Leaflet | undefined> {
    // TODO: Replace with API call when available
    // return this.http.get<Leaflet>(`${this.apiUrl}Leaflets('${id}')`);

    return this.leaflets$.pipe(
      map(leaflets => leaflets.find(l => l.id === id))
    );
  }

  isLeafletValid(leaflet: Leaflet): boolean {
    const now = new Date();
    return new Date(leaflet.validFrom) <= now && new Date(leaflet.validUntil) >= now;
  }

  getDaysRemaining(leaflet: Leaflet): number {
    const now = new Date();
    const end = new Date(leaflet.validUntil);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Map API response to Leaflet interface
   * Adjust based on your actual API response structure
   */
  private mapLeafletsFromAPI(apiData: any[]): Leaflet[] {
    return apiData.map(item => ({
      id: item.id || item.leafletId,
      title: item.title || item.name,
      description: item.description || '',
      thumbnailUrl: item.thumbnailUrl || item.thumbnail || item.imageUrl,
      pdfUrl: item.pdfUrl || item.pdf || item.documentUrl,
      validFrom: new Date(item.validFrom || item.startDate),
      validUntil: new Date(item.validUntil || item.endDate),
      storeId: item.storeId,
      category: this.mapCategory(item.category || item.type),
      isActive: item.isActive !== false
    }));
  }

  private mapCategory(apiCategory: string): 'weekly-specials' | 'seasonal' | 'promotions' | 'catalogue' {
    const categoryMap: { [key: string]: 'weekly-specials' | 'seasonal' | 'promotions' | 'catalogue' } = {
      'weekly': 'weekly-specials',
      'weekly-specials': 'weekly-specials',
      'seasonal': 'seasonal',
      'promotions': 'promotions',
      'promo': 'promotions',
      'catalogue': 'catalogue',
      'catalog': 'catalogue'
    };
    return categoryMap[apiCategory?.toLowerCase()] || 'promotions';
  }

  private handleError(error: any): Observable<Leaflet[]> {
    console.error('LeafletsService error:', error);
    this.leafletsSubject.next([]);
    return of([]);
  }
}
