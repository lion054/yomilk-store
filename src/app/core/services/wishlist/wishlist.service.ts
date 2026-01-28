import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastService } from '../toast/toast.service';
import { WishlistItem } from '../../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlist = new BehaviorSubject<WishlistItem[]>([]);
  wishlistItems$ = this.wishlist.asObservable();

  private wishlistCountSubject = new BehaviorSubject<number>(0);
  wishlistCount$ = this.wishlistCountSubject.asObservable();

  constructor(private toastService: ToastService) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      try {
        const items = JSON.parse(storedWishlist);
        this.wishlist.next(items);
        this.wishlistCountSubject.next(items.length);
      } catch {
        localStorage.removeItem('wishlist');
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist.value));
    this.wishlistCountSubject.next(this.wishlist.value.length);
  }

  getWishlistItems(): WishlistItem[] {
    return this.wishlist.value;
  }

  getWishlistCount(): number {
    return this.wishlist.value.length;
  }

  isInWishlist(itemCode: string): boolean {
    return this.wishlist.value.some(item => item.itemCode === itemCode);
  }

  addToWishlist(item: any): void {
    if (this.isInWishlist(item.itemCode)) {
      this.toastService.info('Already in Wishlist', item.itemName);
      return;
    }

    const wishlistItem: WishlistItem = {
      itemCode: item.itemCode,
      itemName: item.itemName,
      image: item.image || '',
      price: item.price || item.uoMs?.[0]?.price || 0,
      currency: item.currency || item.uoMs?.[0]?.currency || 'USD',
      addedAt: new Date(),
      uom: item.uoMs?.[0] || item.uom
    };

    const updatedWishlist = [...this.wishlist.value, wishlistItem];
    this.wishlist.next(updatedWishlist);
    this.saveToStorage();

    this.toastService.success('Added to Wishlist', item.itemName);
  }

  removeFromWishlist(itemCode: string): void {
    const item = this.wishlist.value.find(i => i.itemCode === itemCode);
    const updatedWishlist = this.wishlist.value.filter(i => i.itemCode !== itemCode);
    this.wishlist.next(updatedWishlist);
    this.saveToStorage();

    if (item) {
      this.toastService.warning('Removed from Wishlist', item.itemName);
    }
  }

  toggleWishlist(item: any): boolean {
    if (this.isInWishlist(item.itemCode)) {
      this.removeFromWishlist(item.itemCode);
      return false;
    } else {
      this.addToWishlist(item);
      return true;
    }
  }

  clearWishlist(): void {
    this.wishlist.next([]);
    this.saveToStorage();
    this.toastService.info('Wishlist Cleared', 'All items have been removed');
  }

  // Move item to cart (requires CartService integration)
  moveToCart(itemCode: string, cartService: any): void {
    const item = this.wishlist.value.find(i => i.itemCode === itemCode);
    if (item) {
      // Add to cart using the item's UoM
      cartService.addToCart(item, item.uom);
      // Remove from wishlist
      this.removeFromWishlist(itemCode);
    }
  }

  // Move all items to cart
  moveAllToCart(cartService: any): void {
    const items = [...this.wishlist.value];
    items.forEach(item => {
      cartService.addToCart(item, item.uom);
    });
    this.clearWishlist();
    this.toastService.success('Added to Cart', `${items.length} items moved to cart`);
  }
}
