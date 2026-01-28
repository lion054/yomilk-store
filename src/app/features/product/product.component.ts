import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {ProductCardComponent} from "../../components/products/product-card/product-card.component";
import {CategoryListComponent} from "../../components/category-list/category-list.component";
import { Product, UoM } from '../../core/interfaces/interfaces';
import { StoreService } from '../../core/services/store/store.service';
import { CartService } from '../../core/services/cart/cart.service';
import { MetaPixelService } from '../../core/services/meta-pixel/meta-pixel.service';
import { GoogleAnalyticsService } from '../../core/services/google-analytics/google-analytics.service';
import { SeoService } from '../../core/services/seo/seo.service';
import { CommonModule } from '@angular/common';
import {BreadcrumbComponent} from "../../components/breadcrumb/breadcrumb.component";
import {FeaturesStripComponent} from "../../components/features-strip/features-strip.component";

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [ProductCardComponent, CategoryListComponent, CommonModule, BreadcrumbComponent, FeaturesStripComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {

  product: Product | null = null;
  quantity: number = 1;
  selectedUom: UoM | null = null;
  mainImage: string = '';
  upsellProducts: Product[] = [];
  crossSellProducts: Product[] = [];
  showModal: boolean = false;
  modalImage: string = '';
  loading: boolean = true;
  isDescriptionExpanded: boolean = false;
  showExpandButton: boolean = false;

  constructor(
    private storeService: StoreService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private metaPixelService: MetaPixelService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private seoService: SeoService
  ) {}

  // ngOnInit() {
  //   const itemCode = this.route.snapshot.paramMap.get('itemCode');
  //   if (itemCode) {
  //     this.loadProduct(itemCode);
  //   }
  // }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const itemCode = params.get('itemCode');
      if (itemCode) {
        this.loadProduct(itemCode);
      }
    });
  }


  trackViewContent() {
    if (this.product) {
      this.metaPixelService.trackViewContent(this.product.itemName, this.product.itemsGroupCode);
      this.googleAnalyticsService.trackEvent('view_item', {
        event_category: 'ecommerce',
        event_label: this.product.itemName,
        item_id: this.product.itemCode,
        item_name: this.product.itemName,
        item_category: this.product.itemsGroupCode
      });
    }
  }

  loadProduct(itemCode: string) {
    // smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });


    this.storeService.getSingleProduct(itemCode).subscribe({
      next: (response: any) => {
        if(response.values.length > 0) {

          this.product = response.values[0] as Product;

          // temporary add hardcoded upsell and crossell array of itemCodes to product
          this.product.u_ONA_Upsells = (this.product.u_ONA_Upsells && this.product.u_ONA_Upsells.length > 0) ? this.product.u_ONA_Upsells : [
            "FMP01",
            "LCB07",
            "MONT020",
            "MONT023",
            "PAN0",
            "PAN0",
            "PAN034",
            "PAN040",
            "PAN043",
            "YCL09",
            "YCL53",
            "YGRT101",
            "YGRT103",
            "YGRT109"
          ];

          this.product.u_ONA_CrossSells = (this.product.u_ONA_CrossSells && this.product.u_ONA_CrossSells.length > 0) ? this.product.u_ONA_CrossSells : [
            "MONT02",
            "MONT021",
            "MONT024",
            "MONT023",
            "PAN0",
            "PAN037",
            "PAN039",
            "PAN041",
            "PAN044",
            "YCL08",
            "YCL52",
            "YGRT01",
            "YGRT102",
            "YGRT105"
          ];

          this.selectedUom = this.product.uoMs[0];

          // if this.selectedUom.uomName is == 'Manual' replace it with 'Item'
          if(this.selectedUom?.uomName.toLowerCase() == 'manual') {
            this.selectedUom.uomName = 'Item';
          }

          this.mainImage = this.product?.image;
          this.loading = false;
          this.loadRelatedProducts();
          this.trackViewContent();
          this.checkDescriptionLength();
          // Set product-specific SEO
          this.seoService.setProductSeo(this.product);
        }
      },
      error: (error) => {
        console.error('Error loading product', error);
        this.loading = false;
      }
    });
  }

  loadRelatedProducts() {
    if (!this.product) return;

    const upsellPayload = {
      currency: this.product.currency,
      warehouseCode: this.product.warehouseCode,
      itemCodes: [this.product.itemCode]
    }

    this.storeService.getUpSells(upsellPayload).subscribe({
      next: (response: any) => {
        let products = response.values.filter((p: Product) => p.itemCode !== this.product!.itemCode);
        // If we have fewer than 5, fetch more from the same category
        if (products.length < 5) {
          this.fillWithCategoryProducts(products, 'upsell');
        } else {
          this.upsellProducts = products.slice(0, 5);
        }
      },
      error: (error) => {
        console.error('Error loading related products', error);
        this.fillWithCategoryProducts([], 'upsell');
      }
    });

    const crossSellPayload = {
      currency: this.product.currency,
      warehouseCode: this.product.warehouseCode,
      itemCodes: [this.product.itemCode]
    }

    this.storeService.getCrossSells(crossSellPayload).subscribe({
      next: (response: any) => {
        let products = response.values.filter((p: Product) => p.itemCode !== this.product!.itemCode);
        // If we have fewer than 5, fetch more from the same category
        if (products.length < 5) {
          this.fillWithCategoryProducts(products, 'crosssell');
        } else {
          this.crossSellProducts = products.slice(0, 5);
        }
      },
      error: (error) => {
        console.error('Error loading related products', error);
        this.fillWithCategoryProducts([], 'crosssell');
      }
    });
  }

  // Fill products array with category products to reach 5 items
  private fillWithCategoryProducts(existingProducts: Product[], type: 'upsell' | 'crosssell') {
    if (!this.product) return;

    const needed = 5 - existingProducts.length;
    const existingCodes = existingProducts.map(p => p.itemCode);
    existingCodes.push(this.product.itemCode); // Exclude current product

    // Fetch products from the same category
    const filterExtension = `$filter=ItemsGroupCode eq ${this.product.itemsGroupCode}`;
    this.storeService.getStoreItems(this.product.currency, 10, 1, '', filterExtension).subscribe({
      next: (response: any) => {
        const categoryProducts = response.values
          .filter((p: Product) => !existingCodes.includes(p.itemCode))
          .slice(0, needed);

        const combined = [...existingProducts, ...categoryProducts].slice(0, 5);

        if (type === 'upsell') {
          this.upsellProducts = combined;
        } else {
          this.crossSellProducts = combined;
        }
      },
      error: () => {
        // If category fetch fails, just use what we have
        if (type === 'upsell') {
          this.upsellProducts = existingProducts;
        } else {
          this.crossSellProducts = existingProducts;
        }
      }
    });
  }

  selectImage(image: string) {
    this.mainImage = image;
  }

  openModal(image: string) {
    this.modalImage = image;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    // Prevent adding to cart if product is out of stock
    if (!this.product || this.product.unitsOnStock < 1) {
      return;
    }

    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(this.product, this.selectedUom);
    }
    this.quantity = 1; // Reset quantity after adding

    // Track add to cart event
    if (this.product && this.selectedUom) {
      this.googleAnalyticsService.trackEvent('add_to_cart', {
        event_category: 'ecommerce',
        event_label: this.product.itemName,
        value: this.selectedUom.price * this.quantity,
        currency: this.selectedUom.currency,
        item_id: this.product.itemCode,
        item_name: this.product.itemName,
        quantity: this.quantity
      });
    }
  }

  // Helper getter for checking if product is out of stock
  get isOutOfStock(): boolean {
    return this.product ? this.product.unitsOnStock < 1 : false;
  }

  selectUom(uom: UoM) {
    this.selectedUom = uom;
  }

  toggleDescription() {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  checkDescriptionLength() {
    // Check if the description element exists and if its content exceeds 5 lines
    setTimeout(() => {
      const descElement = document.getElementById('product-description');
      if (descElement) {
        const lineHeight = parseFloat(getComputedStyle(descElement).lineHeight);
        const height = descElement.scrollHeight;
        const lines = height / lineHeight;
        this.showExpandButton = lines > 5;
      }
    }, 100);
  }

  goBackToStore() {
    this.router.navigate(['/store']);
  }
}
