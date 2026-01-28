import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { CartService } from '../../core/services/cart/cart.service';
import { WishlistItem } from '../../core/interfaces/interfaces';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BreadcrumbComponent
  ],
  templateUrl: './wishlist.component.html'
})
export class WishlistComponent implements OnInit, OnDestroy {
  wishlistItems: WishlistItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);

    this.wishlistService.wishlistItems$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(items => {
      this.wishlistItems = items;
    });
  }

  removeFromWishlist(itemCode: string) {
    this.wishlistService.removeFromWishlist(itemCode);
  }

  moveToCart(item: WishlistItem) {
    this.wishlistService.moveToCart(item.itemCode, this.cartService);
  }

  moveAllToCart() {
    this.wishlistService.moveAllToCart(this.cartService);
  }

  clearWishlist() {
    this.wishlistService.clearWishlist();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
