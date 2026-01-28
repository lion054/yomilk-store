import {Component, OnDestroy, OnInit, HostListener} from '@angular/core';
import {CurrencyService} from "../../core/services/currency/currency.service";
import {CommonModule, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {CartService} from "../../core/services/cart/cart.service";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../core/services/auth/auth.service";
import {WeekendNoticeComponent} from "../weekend-notice/weekend-notice.component";
import {ServicesDrawerComponent} from "../services-drawer/services-drawer.component";
import {MegaMenuComponent} from "../mega-menu/mega-menu.component";
import {ShopSelectorComponent} from "../shop-selector/shop-selector.component";
import {GoogleAnalyticsService} from "../../core/services/google-analytics/google-analytics.service";
import {StoreService} from "../../core/services/store/store.service";
import {WishlistService} from "../../core/services/wishlist/wishlist.service";
import {Subject, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, catchError, of, tap} from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIf,
    RouterLink,
    WeekendNoticeComponent,
    ServicesDrawerComponent,
    MegaMenuComponent,
    ShopSelectorComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  shopAddress: any = "185 Lorely Close, Msasa, Harare, Zimbabwe";
  openAndClosingTime: any ="Mon – Fri: 6:00 am – 5:00 pm, Weekends: Orders Only";
  contact: any = "+263 782 978 460"
  selectedCurrency:any ={};
  currencies:any = []
  itemCount: number = 0;
  wishlistCount: number = 0;
  authenticated: boolean = false
  searchQuery: string = '';
  menuOpen: boolean = false;

  // Department sidebar properties
  showDepartmentSidebar: boolean = false;
  showServicesDrawer: boolean = false;
  showMegaMenu: boolean = false;
  showAlertBanner: boolean = true;
  cartTotal: number = 0;
  deliveryAddress: string = "Enter your address";

  // Debounced search properties
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  searchSuggestions: any[] = [];
  showSuggestions: boolean = false;
  isLoadingSuggestions: boolean = false;

  // Scroll state
  isScrolled: boolean = false;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 50;
  }

  // Categories from API
  categories: any[] = [];
  isLoadingCategories: boolean = false;

  // Category emoji mapping
  categoryEmojis: { [key: string]: string } = {
    'FRUITS': '🍎',
    'VEGETABLES': '🥬',
    'DAIRY': '🥛',
    'MILK': '🥛',
    'FRESH MILK': '🥛',
    'MEAT': '🥩',
    'SEAFOOD': '🐟',
    'BREAD': '🍞',
    'BAKERY': '🍞',
    'BEVERAGES': '🥤',
    'SNACKS': '🍿',
    'FROZEN': '❄️',
    'PERSONAL CARE': '🧴',
    'HOUSEHOLD': '🏠',
    'HOMECARE': '🏠',
    'GROCERY': '🛒',
    'CONDIMENTS': '🧂',
    'CANNED': '🥫',
    'CEREALS': '🥣',
    'BABY': '👶',
    'PET': '🐕',
    'PETCARE': '🐕',
    'CHEESE': '🧀',
    'CREAM': '🍦',
    'FRESH CREAM': '🍦',
    'YOGHURT': '🥄',
    'YOGURT': '🥄',
    'YOLAC': '🥛',
    'PANTRY': '🥫',
    'LIFE': '💊',
    'DEFAULT': '📦'
  };

    constructor(
      private currencyService:CurrencyService,
      private cartService: CartService,
      public router: Router,
      private authService: AuthService,
      private googleAnalyticsService: GoogleAnalyticsService,
      private storeService: StoreService,
      private wishlistService: WishlistService
    ) {
    }

    ngOnInit() {
      // Setup reactive search with debouncing
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(term => term.length >= 2),
        tap(() => {
          this.isLoadingSuggestions = true;
        }),
        switchMap(term => {
          const activeCurrency = this.selectedCurrency?.code || 'USD';
          const queryExtension = `$filter = contains(ItemName, '${term}')`;
          return this.storeService.getStoreItems(activeCurrency, 7, 1, '', queryExtension).pipe(
            catchError(error => {
              console.error('Error fetching suggestions:', error);
              this.isLoadingSuggestions = false;
              return of({ values: [] });
            })
          );
        }),
        takeUntil(this.destroy$)
      ).subscribe((response: any) => {
        this.searchSuggestions = response.values || [];
        this.showSuggestions = this.searchSuggestions.length > 0;
        this.isLoadingSuggestions = false;
      });

      this.currencyService.getCurrencies().subscribe(
        (response:any) => {
          this.currencies = response;
          this.currencyService.selectedCurrency$.subscribe(
            currency => {
              console.log("CURRENCY THE RESULT:",currency)

              this.selectedCurrency = this.currencies.find((element:any) => element.code === currency.code)
            }
          )
        }
      );

      this.cartService.cartItems$.subscribe(items => {
        this.itemCount = items.length;
        // Calculate cart total
        this.cartTotal = items.reduce((total: number, item: any) => {
          return total + (item.price * (item.quantity || 1));
        }, 0);
      });

      // Subscribe to wishlist count
      this.wishlistService.wishlistCount$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(count => {
        this.wishlistCount = count;
      });

      this.authenticated = this.authService.getAuthUser().customer?.isVisitor? false : !this.authService.getAuthUser().customer?.isVisitor;

    // Fetch categories from API
    this.loadCategories();
    }

  loadCategories() {
    this.isLoadingCategories = true;

    // Directly fetch categories from API
    this.storeService.getItemGroups(50, 1, '', '').pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Error fetching categories:', error);
        this.isLoadingCategories = false;
        return of({ values: [] });
      })
    ).subscribe((response: any) => {
      console.log('Categories loaded:', response);
      // Ensure we get an array, not a function
      if (Array.isArray(response.values)) {
        this.categories = response.values;
      } else if (Array.isArray(response)) {
        this.categories = response;
      } else {
        this.categories = [];
      }
      this.isLoadingCategories = false;
    });
  }

  getCategoryEmoji(categoryName: string): string {
    const upperName = categoryName?.toUpperCase() || '';
    for (const key of Object.keys(this.categoryEmojis)) {
      if (upperName.includes(key)) {
        return this.categoryEmojis[key];
      }
    }
    return this.categoryEmojis['DEFAULT'];
  }

  onCurrencyChange(): void {
    console.log("Currency Changed: ",this.selectedCurrency.name)
    this.currencyService.setSelectedCurrency(this.selectedCurrency);
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery);
  }

  onSearchFocus() {
    if (this.searchSuggestions.length > 0 && this.searchQuery.length >= 2) {
      this.showSuggestions = true;
    }
  }

  selectSuggestion(product: any) {
    this.closeSuggestions();
    this.router.navigate(['/product', product.itemCode]);
  }

  closeSuggestions() {
    this.showSuggestions = false;
    this.searchSuggestions = [];
  }

  search() {
    if (this.searchQuery.trim()) {
      this.closeSuggestions();
      this.googleAnalyticsService.trackEvent('search', {
        event_category: 'engagement',
        event_label: 'search_performed',
        search_term: this.searchQuery
      });
      this.router.navigate(['/store'], {
        queryParams: { queryExtension: this.searchQuery }
      });
    }
  }

  trackNavigation(page: string) {
    this.googleAnalyticsService.trackEvent('page_view', {
      event_category: 'navigation',
      event_label: page,
      page_path: `/${page}`
    });
  }

  toggleDepartmentSidebar() {
    this.showDepartmentSidebar = !this.showDepartmentSidebar;
  }

  toggleServicesDrawer() {
    this.showServicesDrawer = !this.showServicesDrawer;
  }

  toggleMegaMenu() {
    this.showMegaMenu = !this.showMegaMenu;
  }

  openMegaMenu() {
    this.showMegaMenu = true;
  }

  closeMegaMenu() {
    this.showMegaMenu = false;
  }

  dismissAlertBanner() {
    this.showAlertBanner = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
