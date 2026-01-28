import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { CartService } from '../../core/services/cart/cart.service';
import { WishlistItem } from '../../core/interfaces/interfaces';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];

  constructor(
    public wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.wishlistService.wishlistItems$.subscribe(items => {
      this.wishlistItems = items;
    });
  }

  removeFromWishlist(itemCode: string): void {
    this.wishlistService.removeFromWishlist(itemCode);
  }

  addToCart(item: WishlistItem): void {
    const product = {
      itemCode: item.itemCode,
      itemName: item.itemName,
      image: item.image,
      price: item.price,
      currency: item.currency
    };

    const uom = item.uom || {
      uomEntry: 0,
      uomName: 'EA',
      price: item.price,
      currency: item.currency,
      inStock: 999,
      inventoryQuantityFactor: 1,
      isPricingUOM: true,
      isInventoryOM: false,
      uomQuantity: 1
    };

    this.cartService.addToCart(product, uom);
  }

  addAllToCart(): void {
    this.wishlistItems.forEach(item => {
      this.addToCart(item);
    });
  }

  clearWishlist(): void {
    this.wishlistService.clearWishlist();
  }
}
