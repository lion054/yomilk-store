import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WishlistItem } from '../../interfaces/interfaces';
import { ToastService } from '../toast/toast.service';
import { GoogleAnalyticsService } from '../google-analytics/google-analytics.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlist = new BehaviorSubject<WishlistItem[]>([]);
  wishlistItems$ = this.wishlist.asObservable();
  wishlistCount$ = this.wishlist.asObservable().pipe(
    map(items => items.length)
  );

  constructor(
    private toastService: ToastService,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      this.wishlist.next(JSON.parse(storedWishlist));
    }
  }

  getWishlistItems(): WishlistItem[] {
    return this.wishlist.value;
  }

  addToWishlist(item: any, uom?: any): void {
    const existingItem = this.wishlist.value.find((i) => i.itemCode === item.itemCode);

    if (existingItem) {
      this.toastService.info('Already in Wishlist', item.itemName);
      return;
    }

    const wishlistItem: WishlistItem = {
      itemCode: item.itemCode,
      itemName: item.itemName,
      image: item.image,
      price: uom?.price || item.price,
      currency: uom?.currency || item.currency,
      addedAt: new Date(),
      uom: uom
    };

    const updatedWishlist = [...this.wishlist.value, wishlistItem];
    this.wishlist.next(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));

    // Track add to wishlist event
    this.googleAnalyticsService.trackEcommerceEvent('add_to_wishlist', [{
      item_id: item.itemCode,
      item_name: item.itemName,
      price: wishlistItem.price,
      currency: wishlistItem.currency
    }], wishlistItem.price, wishlistItem.currency);

    this.toastService.success('Added to Wishlist', item.itemName);
  }

  removeFromWishlist(itemCode: string): void {
    const item = this.wishlist.value.find(i => i.itemCode === itemCode);
    if (!item) return;

    const updatedWishlist = this.wishlist.value.filter((i) => i.itemCode !== itemCode);
    this.wishlist.next(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));

    // Track remove from wishlist event
    this.googleAnalyticsService.trackEcommerceEvent('remove_from_wishlist', [{
      item_id: item.itemCode,
      item_name: item.itemName,
      price: item.price,
      currency: item.currency
    }], item.price, item.currency);

    this.toastService.warning('Removed from Wishlist', item.itemName);
  }

  toggleWishlist(item: any, uom?: any): boolean {
    const isInWishlist = this.isInWishlist(item.itemCode);

    if (isInWishlist) {
      this.removeFromWishlist(item.itemCode);
      return false;
    } else {
      this.addToWishlist(item, uom);
      return true;
    }
  }

  isInWishlist(itemCode: string): boolean {
    return this.wishlist.value.some((i) => i.itemCode === itemCode);
  }

  getCount(): number {
    return this.wishlist.value.length;
  }

  getCount$(): Observable<number> {
    return new Observable(observer => {
      this.wishlist.subscribe(items => {
        observer.next(items.length);
      });
    });
  }

  clearWishlist(): void {
    this.wishlist.next([]);
    localStorage.removeItem('wishlist');
    this.toastService.info('Wishlist Cleared', 'All items have been removed');
  }
}
