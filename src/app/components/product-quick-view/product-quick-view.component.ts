import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart/cart.service';
import { WishlistService } from '../../core/services/wishlist/wishlist.service';
import { ToastService } from '../../core/services/toast/toast.service';

@Component({
  selector: 'app-product-quick-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          (click)="close()"
          [@fadeIn]>
        </div>
        <!-- Modal -->
        <div
          class="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
          [@slideUp]
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="'Quick view for ' + product?.itemName">
          <!-- Close Button -->
          <button
            (click)="close()"
            class="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Close quick view">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
          <div class="overflow-y-auto max-h-[90vh] hide-scrollbar">
            <div class="grid md:grid-cols-2 gap-8 p-8">
              <!-- Product Image -->
              <div class="relative">
                <div class="aspect-square rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden sticky top-0">
                  <img
                    [src]="product?.image || 'assets/images/woocommerce-placeholder.webp'"
                    [alt]="product?.itemName"
                    class="w-full h-full object-contain p-8 transition-transform duration-500 hover:scale-110"
                    loading="lazy"
                    />
                  <!-- Wishlist Button -->
                  <button
                    (click)="toggleWishlist()"
                  [class]="isInWishlist
                    ? 'absolute top-4 left-4 w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300'
                    : 'absolute top-4 left-4 w-12 h-12 bg-white/80 backdrop-blur-md hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300'"
                    [attr.aria-label]="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" [attr.fill]="isInWishlist ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <!-- Product Details -->
              <div class="flex flex-col space-y-6">
                <!-- Title -->
                <div>
                  <h2 class="text-3xl font-bold text-gray-900 mb-2">
                    {{ product?.itemName }}
                  </h2>
                  <p class="text-sm text-gray-500">
                    SKU: {{ product?.itemCode }}
                  </p>
                </div>
                <!-- Price -->
                <div class="flex items-baseline gap-3">
                  <span class="text-4xl font-bold bg-gradient-to-r from-[#42af57] to-[#3d9332] bg-clip-text text-transparent">
                    {{ product?.currency }}{{ activeUoM?.price | number:'1.2-2' }}
                  </span>
                </div>
                <!-- Stock Status -->
                @if (stockLevel !== 'InStock') {
                  <div class="flex items-center gap-2">
                    <span
                  [class]="stockLevel === 'Low Stock'
                    ? 'inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-xl text-sm font-semibold'
                    : 'inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-xl text-sm font-semibold'">
                      <span class="w-2 h-2 rounded-full" [class]="stockLevel === 'Low Stock' ? 'bg-amber-500 animate-pulse' : 'bg-gray-500'"></span>
                      {{ stockLevel }}
                    </span>
                  </div>
                }
                <!-- UoM Selector -->
                @if (product?.uoMs && product.uoMs.length > 1) {
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-700">
                      Select Size
                    </label>
                    <div class="flex flex-wrap gap-2">
                      @for (uom of product.uoMs; track uom) {
                        <button
                          (click)="selectUoM(uom)"
                    [class]="uom === activeUoM
                      ? 'px-4 py-2 border-2 border-[#42af57] bg-[#42af57]/10 text-[#42af57] rounded-xl font-semibold text-sm transition-all duration-200'
                      : 'px-4 py-2 border-2 border-gray-200 hover:border-[#42af57]/50 bg-white text-gray-700 rounded-xl font-semibold text-sm transition-all duration-200'">
                          {{ uom.uomName }}
                        </button>
                      }
                    </div>
                  </div>
                }
                <!-- Description -->
                @if (product?.description) {
                  <div class="space-y-2">
                    <h3 class="text-sm font-semibold text-gray-700">Description</h3>
                    <p class="text-sm text-gray-600 leading-relaxed">
                      {{ product.description }}
                    </p>
                  </div>
                }
                <!-- Features -->
                <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div class="text-center">
                    <div class="w-12 h-12 mx-auto bg-green-100 rounded-xl flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#42af57" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                        <path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                        <circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
                      </svg>
                    </div>
                    <p class="text-xs text-gray-600 font-medium">Fast Delivery</p>
                  </div>
                  <div class="text-center">
                    <div class="w-12 h-12 mx-auto bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                      </svg>
                    </div>
                    <p class="text-xs text-gray-600 font-medium">Quality Guaranteed</p>
                  </div>
                  <div class="text-center">
                    <div class="w-12 h-12 mx-auto bg-amber-100 rounded-xl flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
                        <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
                        <path d="M12 3v6"/>
                      </svg>
                    </div>
                    <p class="text-xs text-gray-600 font-medium">Fresh Products</p>
                  </div>
                </div>
                <!-- Action Buttons -->
                <div class="flex gap-3 pt-6">
                  @if (stockLevel !== 'Sold Out') {
                    <button
                      (click)="addToCart()"
                      class="flex-1 py-4 bg-gradient-to-r from-[#42af57] to-[#4a9a48] hover:from-[#4a9a48] hover:to-[#3d9332] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                      </svg>
                      Add to Cart
                    </button>
                  }
                  @if (stockLevel === 'Sold Out') {
                    <button
                      disabled
                      class="flex-1 py-4 bg-gray-200 text-gray-500 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                      Out of Stock
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
    `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `]
})
export class ProductQuickViewComponent implements OnInit {
  @Input() product: any;
  @Input() isOpen: boolean = false;
  @Output() closed = new EventEmitter<void>();

  activeUoM: any;
  stockLevel: string = 'InStock';
  lowStockThreshold = 5;
  isInWishlist: boolean = false;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    if (this.product) {
      this.activeUoM = this.product.uoMs?.[0];
      this.checkStockLevel();
      this.isInWishlist = this.wishlistService.isInWishlist(this.product.itemCode);
    }

    // Prevent body scroll when modal is open
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  checkStockLevel() {
    const stock = this.activeUoM?.inStock || this.product?.unitsOnStock || 0;
    if (stock > this.lowStockThreshold) {
      this.stockLevel = 'InStock';
    } else if (stock > 0) {
      this.stockLevel = 'Low Stock';
    } else {
      this.stockLevel = 'Sold Out';
    }
  }

  selectUoM(uom: any) {
    this.activeUoM = uom;
    this.checkStockLevel();
  }

  addToCart() {
    this.cartService.addToCart(this.product, this.activeUoM);
    this.toastService.success('Added to cart', `${this.product.itemName} has been added to your cart`);
  }

  toggleWishlist() {
    this.wishlistService.toggleWishlist(this.product);
    this.isInWishlist = !this.isInWishlist;
  }

  close() {
    document.body.style.overflow = '';
    this.closed.emit();
  }
}
