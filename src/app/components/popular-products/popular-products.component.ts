import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../products/product-card/product-card.component';
import { StoreService } from '../../core/services/store/store.service';

interface CategoryTab {
  name: string;
  code: string | null;
  active: boolean;
}

@Component({
  selector: 'app-popular-products',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './popular-products.component.html',
  styleUrl: './popular-products.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PopularProductsComponent implements OnInit {
  @ViewChild('productContainer') productContainer!: ElementRef;

  categoryTabs: CategoryTab[] = [
    { name: 'All', code: null, active: true },
    { name: 'Milks & Dairies', code: 'DAIRY', active: false },
    { name: 'Coffes & Teas', code: 'BEVERAGES', active: false },
    { name: 'Pet Foods', code: 'PET', active: false },
    { name: 'Meats', code: 'MEAT', active: false },
    { name: 'Vegetables', code: 'VEGETABLES', active: false },
    { name: 'Fruits', code: 'FRUITS', active: false }
  ];

  products: any[] = [];
  loading = false;
  activeCategory: string | null = null;

  constructor(private storeService: StoreService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(categoryCode: string | null = null) {
    this.loading = true;
    this.activeCategory = categoryCode;

    const filterExtension = categoryCode ? `$filter=contains(ItemsGroupCode,'${categoryCode}')` : '';

    this.storeService.getStoreItems(undefined, 10, 1, '', filterExtension).subscribe({
      next: (response: any) => {
        this.products = response.values || response.content || response || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.products = [];
      }
    });
  }

  selectCategory(tab: CategoryTab) {
    this.categoryTabs.forEach(t => t.active = false);
    tab.active = true;
    this.loadProducts(tab.code);
  }

  scrollLeft() {
    if (this.productContainer) {
      this.productContainer.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollRight() {
    if (this.productContainer) {
      this.productContainer.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }
}
