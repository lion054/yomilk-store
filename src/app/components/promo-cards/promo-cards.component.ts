import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../core/services/store/store.service';
import { CurrencyService } from '../../core/services/currency/currency.service';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface PromoCard {
  title: string;
  titleLine2: string;
  titleLine3: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  bgGradient: string;
  hasSaveTag?: boolean;
  product?: any;
  categoryName?: string;
}

@Component({
  selector: 'app-promo-cards',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './promo-cards.component.html',
  styleUrl: './promo-cards.component.css'
})
export class PromoCardsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoading = true;
  activeCurrency = 'USD';

  // Category configurations with fallback images and gradients
  categoryConfigs = [
    {
      groupCode: '',
      groupName: 'Fresh Produce',
      title: 'Everyday Fresh &',
      titleLine2: 'Clean with Our',
      titleLine3: 'Products',
      bgGradient: 'from-[#fef3e2] to-[#fde8c9]',
      fallbackImage: 'assets/images/fruits-min.jpg',
      buttonLink: '/store'
    },
    {
      groupCode: '',
      groupName: 'Dairy',
      title: 'Make your Breakfast',
      titleLine2: 'Healthy and Easy',
      titleLine3: '',
      bgGradient: 'from-[#fce4ec] to-[#f8bbd9]',
      fallbackImage: 'assets/images/dairy.jpg',
      buttonLink: '/store',
      hasSaveTag: true
    },
    {
      groupCode: '',
      groupName: 'Groceries',
      title: 'The best Organic',
      titleLine2: 'Products Online',
      titleLine3: '',
      bgGradient: 'from-[#e3f2fd] to-[#bbdefb]',
      fallbackImage: 'assets/images/groceries-min.jpg',
      buttonLink: '/store'
    }
  ];

  promoCards: PromoCard[] = [];
  categories: any[] = [];

  constructor(
    private storeService: StoreService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit() {
    // Initialize with static content immediately for fast render
    this.initializeStaticCards();

    // Get active currency
    this.currencyService.selectedCurrency$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((currency: any) => {
      this.activeCurrency = currency?.code || 'USD';
    });

    // Load dynamic content in background
    this.loadDynamicContent();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeStaticCards() {
    // Show cards immediately with fallback images
    this.promoCards = this.categoryConfigs.map(config => ({
      title: config.title,
      titleLine2: config.titleLine2,
      titleLine3: config.titleLine3,
      subtitle: config.groupName,
      buttonText: 'Shop Now',
      buttonLink: config.buttonLink,
      imageUrl: config.fallbackImage,
      bgGradient: config.bgGradient,
      hasSaveTag: (config as any).hasSaveTag || false,
      product: null,
      categoryName: config.groupName
    }));
    this.isLoading = false;
  }

  loadDynamicContent() {
    // Fetch categories to find matching group codes
    this.storeService.getItemGroups(50, 1, '', '').pipe(
      takeUntil(this.destroy$),
      catchError(() => of({ values: [] }))
    ).subscribe((response: any) => {
      // Ensure we get an array, not a function
      if (Array.isArray(response.values)) {
        this.categories = response.values;
      } else if (Array.isArray(response)) {
        this.categories = response;
      } else {
        this.categories = [];
      }
      this.matchCategoriesToConfigs();
      this.fetchFeaturedProducts();
    });
  }

  matchCategoriesToConfigs() {
    const categoryKeywords = [
      ['FRUIT', 'VEGETABLE', 'PRODUCE', 'FRESH'],
      ['DAIRY', 'MILK', 'CHEESE', 'YOGURT'],
      ['GROCERY', 'GROCERIES', 'FOOD', 'PANTRY', 'BEVERAGE']
    ];

    this.categoryConfigs.forEach((config, index) => {
      const keywords = categoryKeywords[index];
      const matchedCategory = this.categories.find((cat: any) => {
        const name = (cat.groupName || '').toUpperCase();
        return keywords.some(keyword => name.includes(keyword));
      });

      if (matchedCategory) {
        config.groupCode = matchedCategory.number;
        config.groupName = matchedCategory.groupName;
        config.buttonLink = `/store?group=${matchedCategory.number}`;

        // Update the static card with the matched category
        if (this.promoCards[index]) {
          this.promoCards[index].buttonLink = config.buttonLink;
          this.promoCards[index].categoryName = matchedCategory.groupName;
        }
      }
    });
  }

  fetchFeaturedProducts() {
    const requests = this.categoryConfigs.map((config) => {
      if (config.groupCode) {
        const filterExtension = `$filter=ItemsGroupCode eq ${config.groupCode}`;
        return this.storeService.getStoreItems(this.activeCurrency, 1, 1, '', filterExtension).pipe(
          map((response: any) => {
            const products = response.values || [];
            return products.length > 0 ? products[0] : null;
          }),
          catchError(() => of(null))
        );
      }
      return of(null);
    });

    forkJoin(requests).pipe(
      takeUntil(this.destroy$)
    ).subscribe((products: any[]) => {
      // Update cards with product images if available
      products.forEach((product, index) => {
        if (product && this.promoCards[index]) {
          const productImage = product.image || (product.pictures && product.pictures[0]);
          if (productImage) {
            this.promoCards[index].imageUrl = productImage;
          }
          this.promoCards[index].product = product;
        }
      });
    });
  }
}
