import {Component, ElementRef, Input, OnInit, OnDestroy, ViewChild, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {CurrencyService} from "../../../core/services/currency/currency.service";
import {CurrencyPipe, DecimalPipe, NgClass, NgFor, NgForOf, NgIf, NgStyle} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {CartService} from "../../../core/services/cart/cart.service";
import {MetaPixelService} from "../../../core/services/meta-pixel/meta-pixel.service";
import {GoogleAnalyticsService} from "../../../core/services/google-analytics/google-analytics.service";
import {WishlistService} from "../../../core/services/wishlist/wishlist.service";
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    DecimalPipe,
    NgFor,
    FormsModule,
    NgIf,
    NgStyle,
    NgClass,
    CurrencyPipe
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent implements OnInit, OnDestroy {

  selectedCurrency: any;

  @Input()
  product:any;
  @Output() quickViewTriggered = new EventEmitter<any>();

  uoms: any = []
  activeUoM: any;
  insertedUom: boolean = false;
  // Instock , Low , SoldOut
  stockLevel: any = "InStock";
  lowStockThreshold = 5;

  // Wishlist state
  isInWishlist: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private currencyService:CurrencyService,
    private cartService: CartService,
    private router: Router,
    private metaPixelService: MetaPixelService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private wishlistService: WishlistService
  ) {
    // currencyService.selectedCurrency$.subscribe((currency:any) => {
    //   this.selectedCurrency = currency;
    // })

  }

  checkStockLevel() {
    if(this.insertedUom){
      if(this.product.unitsOnStock > this.lowStockThreshold){
        this.stockLevel = "InStock";
      }else if(this.product.unitsOnStock > 0){
        this.stockLevel = "Low Stock";
      }else {
        this.stockLevel = "Sold Out";
      }
    }else {
      //Stock taken from UOM
      if(this.activeUoM.inStock > this.lowStockThreshold){
        this.stockLevel = "InStock";
      }else if(this.activeUoM.inStock > 0){
        this.stockLevel = "Low Stock";
      }else {
        this.stockLevel = "Sold Out";
      }
    }
  }


  ngOnInit() {

    /// if product has no unit of measure insert a fake UOM based on the header object

    const condition = this.product.uoMs.length === 0 // proper condition
    const tempCondition = true; // Todo temporary

    if(tempCondition){
      const  tempUom:any = {
          "uomEntry": null,
          "uomName": "Item",
          "price": this.product.price,
          "inStock": null,
          "inventoryQuantityFactor": null,
          "currency": this.product.currency,
          "isPricingUOM": false,
          "isInventoryOM": false,
          "uomQuantity": null
        }

        this.product.uoMs = [];
        this.product.uoMs.push(tempUom);

        this.insertedUom = true;
    }

    this.activeUoM = this.product.uoMs[0];
    this.checkStockLevel();

    // Track product view event
    this.googleAnalyticsService.trackEvent('view_item', {
      event_category: 'ecommerce',
      event_label: this.product.itemName,
      item_id: this.product.itemCode,
      item_name: this.product.itemName,
      item_category: this.product.itemsGroupCode
    });

    // Subscribe to wishlist changes
    this.wishlistService.wishlistItems$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isInWishlist = this.wishlistService.isInWishlist(this.product.itemCode);
    });
  }

  toggleWishlist() {
    this.wishlistService.toggleWishlist(this.product);
  }

  openQuickView() {
    this.quickViewTriggered.emit(this.product);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addToCart() {
    ///add logic to add custom object to cart Todo Change later
    this.cartService.addToCart(this.product, this.activeUoM);
    this.metaPixelService.trackAddToCart(this.product.itemName, this.activeUoM.price, this.activeUoM.currency);
    this.googleAnalyticsService.trackEvent('add_to_cart', {
      event_category: 'ecommerce',
      event_label: this.product.itemName,
      value: this.activeUoM.price,
      currency: this.activeUoM.currency,
      item_id: this.product.itemCode,
      item_name: this.product.itemName
    });
  }

  navigateToProduct() {
    // Todo Enable when API is ready
    this.router.navigate(['/product', this.product.itemCode]);
  }

  // New Blending Stuff



  // holds the CSS color string, e.g. 'rgb(123,45,67)' or '#7B2D43'
  dominantColor: string = 'rgba(255,255,255,0.5)'; // fallback

  // If you want to reference the <img> directly:
  @ViewChild('productImg') productImgRef!: ElementRef<HTMLImageElement>;

  // // Call this from the template <img (load)="onImageLoad($event)">
  // onImageLoad(event: Event) {
  //   const img = event.target as HTMLImageElement;
  //   // Create a small offscreen canvas to sample the image
  //   const canvas = document.createElement('canvas');
  //   const ctx = canvas.getContext('2d');
  //   if (!ctx) {
  //     return;
  //   }
  //   // To reduce work, draw at a reduced size:
  //   const sampleSize = 50; // draw image shrunk to 50x50
  //   canvas.width = sampleSize;
  //   canvas.height = sampleSize;
  //   // Draw the image scaled down:
  //   ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
  //   // Get pixel data
  //   const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
  //   let rSum = 0, gSum = 0, bSum = 0, count = 0;
  //   // Sample every pixel in the small canvas:
  //   for (let i = 0; i < imageData.length; i += 4) {
  //     const alpha = imageData[i + 3];
  //     if (alpha < 128) {
  //       // skip mostly transparent pixels
  //       continue;
  //     }
  //     rSum += imageData[i];
  //     gSum += imageData[i + 1];
  //     bSum += imageData[i + 2];
  //     count++;
  //   }
  //   if (count > 0) {
  //     const r = Math.round(rSum / count);
  //     const g = Math.round(gSum / count);
  //     const b = Math.round(bSum / count);
  //     // You can choose rgb(...) or convert to hex if preferred
  //     this.dominantColor = `rgb(${r}, ${g}, ${b})`;
  //   }
  // }


  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;

    // Verify this is still the correct image for this component
    if (img.src !== this.getCurrentImageSrc()) {
      return; // Ignore if image source has changed
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx || !img.complete) {
      return;
    }

    try {
      const sampleSize = 50;
      canvas.width = sampleSize;
      canvas.height = sampleSize;

      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

      let rSum = 0, gSum = 0, bSum = 0, count = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        const alpha = imageData[i + 3];
        if (alpha < 128) continue;

        rSum += imageData[i];
        gSum += imageData[i + 1];
        bSum += imageData[i + 2];
        count++;
      }

      if (count > 0) {
        const r = Math.round(rSum / count);
        const g = Math.round(gSum / count);
        const b = Math.round(bSum / count);
        this.dominantColor = `rgba(${r}, ${g}, ${b}, 0.1)`; // Made more subtle
      }
    } catch (error) {
      // Silently handle cross-origin and other canvas errors
      this.dominantColor = 'rgba(255,255,255,0.5)'; // fallback
    }
  }

  private getCurrentImageSrc(): string {
    return this.product.image || 'assets/images/woocommerce-placeholder.webp';
  }

}
