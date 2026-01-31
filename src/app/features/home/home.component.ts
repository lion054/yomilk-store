import {Component, OnInit, OnDestroy} from '@angular/core';
import {StoreService} from "../../core/services/store/store.service";
import {RouterLink} from '@angular/router';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ProductCardComponent} from "../../components/products/product-card/product-card.component";
import {HeroSliderComponent} from "../../components/hero-slider/hero-slider.component";
import {PromoCardsComponent} from "../../components/promo-cards/promo-cards.component";
import {ExploreCategoriesComponent} from "../../components/explore-categories/explore-categories.component";
import {TopVendorsComponent} from "../../components/top-vendors/top-vendors.component";
import {FeaturesStripComponent} from "../../components/features-strip/features-strip.component";
import {B2bService, StoreOrderSchedule} from "../../core/services/b2b/b2b.service";
import {AuthService} from "../../core/services/auth/auth.service";
import {VendorsService, Vendor} from "../../core/services/vendors/vendors.service";
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ProductCardComponent,
    HeroSliderComponent,
    PromoCardsComponent,
    ExploreCategoriesComponent,
    TopVendorsComponent,
    FeaturesStripComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedCurrency: any;
  pageNumber:any = 1;
  pageSize:number = 30;
  totalPages:number = 123;
  searchTerm: string = '';
  categories: any = null;

  // Newsletter form
  email: string = '';

  // Promo cards (from API or mock data)
  promoCards: any[] = [];

  // Products (from API)
  products: any[] = [];

  // B2B Order Schedules
  orderSchedules: StoreOrderSchedule[] = [];
  isLoadingSchedules = true;
  scheduleCountdowns: { [key: number]: { days: number; hours: number; mins: number; secs: number } } = {};
  private countdownInterval: any;
  isLoggedIn = false;
  private destroy$ = new Subject<void>();

  // Vendors data (from API)
  vendors: Vendor[] = [];
  isLoadingVendors = true;

  // Vendor gradient colors
  vendorGradients = [
    'bg-gradient-to-br from-[#42af57] to-[#2d7a3e]',
    'bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8]',
    'bg-gradient-to-br from-[#f59e0b] to-[#d97706]',
    'bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9]',
    'bg-gradient-to-br from-[#ef4444] to-[#b91c1c]',
    'bg-gradient-to-br from-[#06b6d4] to-[#0891b2]'
  ];

  // Deals data (from API - TODO: implement deals API endpoint)
  deals: any[] = [];

  constructor(
    private storeService: StoreService,
    private b2bService: B2bService,
    private authService: AuthService,
    private vendorsService: VendorsService
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);

    // Load categories
    this.storeService.getItemGroups().subscribe((categories: any) => {
      this.categories = this.shuffleArray([...categories]);
    });

    // Check if user is logged in
    const user = this.authService.getAuthUser();
    this.isLoggedIn = !!(user && !user.customer?.isVisitor);

    // Load products
    this.loadProducts();

    // Load promo cards
    this.loadPromoCards();

    // Load vendors from API
    this.loadVendors();

    // Load B2B schedules
    this.loadOrderSchedules();
  }

  loadProducts(): void {
    this.storeService.getStoreItems(undefined, 20, 1).subscribe({
      next: (data: any) => {
        this.products = data?.data || [];
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.products = [];
      }
    });
  }

  loadPromoCards(): void {
    // Mock promo cards - replace with API call if available
    this.promoCards = [
      {
        title: 'Everyday Fresh &',
        titleLine2: 'Clean with Our',
        titleLine3: 'Products',
        imageUrl: 'assets/images/banner-1.png',
        product: null
      },
      {
        title: 'Make your Breakfast',
        titleLine2: 'Healthy and Easy',
        titleLine3: '',
        imageUrl: 'assets/images/banner-2.png',
        product: null
      },
      {
        title: 'The best Organic',
        titleLine2: 'Products Online',
        titleLine3: '',
        imageUrl: 'assets/images/banner-3.png',
        product: null
      }
    ];
  }

  onSubscribe(): void {
    if (!this.email) {
      alert('Please enter your email address');
      return;
    }
    // TODO: Implement newsletter subscription API call
    console.log('Subscribing with email:', this.email);
    alert('Thank you for subscribing!');
    this.email = '';
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrderSchedules(): void {
    this.isLoadingSchedules = true;
    this.b2bService.getAvailableSchedules().subscribe({
      next: (schedules) => {
        // Filter only open schedules and take first 4
        this.orderSchedules = schedules
          .filter(s => s.Status === 'Open')
          .slice(0, 4);

        if (this.orderSchedules.length > 0) {
          this.initCountdowns();
        }
        this.isLoadingSchedules = false;
      },
      error: (error) => {
        console.error('Error loading schedules:', error);
        this.orderSchedules = [];
        this.isLoadingSchedules = false;
      }
    });
  }

  loadVendors(): void {
    this.isLoadingVendors = true;

    // Fetch vendors from API - returns empty array if API not available
    this.vendorsService.getVendors().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (vendors) => {
        // If API returns vendors, use them
        if (vendors && vendors.length > 0) {
          this.vendors = vendors.slice(0, 4); // Show max 4 vendors on home page
        } else {
          // Fallback: Show only the main vendor (YoMilk) with real logo
          this.vendors = [{
            code: 'yomilk',
            name: 'YoMilk',
            logo: 'logo.png',
            rating: 5.0,
            since: 2015,
            products: 50,
            positive: 98,
            orders: '1.2K',
            address: 'Harare, Zimbabwe',
            badge: 'featured',
            description: 'Premium dairy products & fresh groceries delivered to your doorstep',
            features: ['Fresh Daily', 'Quality Assured', 'Fast Delivery'],
            hasB2B: true
          }];
        }
        this.isLoadingVendors = false;
      },
      error: (error) => {
        console.error('Error loading vendors:', error);
        // On error, still show main vendor
        this.vendors = [{
          code: 'yomilk',
          name: 'YoMilk',
          logo: 'logo.png',
          rating: 5.0,
          since: 2015,
          products: 50,
          positive: 98,
          orders: '1.2K',
          address: 'Harare, Zimbabwe',
          badge: 'featured',
          description: 'Premium dairy products & fresh groceries delivered to your doorstep',
          features: ['Fresh Daily', 'Quality Assured', 'Fast Delivery'],
          hasB2B: true
        }];
        this.isLoadingVendors = false;
      }
    });
  }

  private initCountdowns(): void {
    // Initialize countdown for each schedule
    this.orderSchedules.forEach(schedule => {
      this.updateCountdown(schedule);
    });

    // Update every second
    this.countdownInterval = setInterval(() => {
      this.orderSchedules.forEach(schedule => {
        this.updateCountdown(schedule);
      });
    }, 1000);
  }

  private updateCountdown(schedule: StoreOrderSchedule): void {
    const endDate = new Date(schedule.EndDate).getTime();
    const now = Date.now();
    const diff = endDate - now;

    if (diff <= 0) {
      this.scheduleCountdowns[schedule.DocEntry] = { days: 0, hours: 0, mins: 0, secs: 0 };
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    this.scheduleCountdowns[schedule.DocEntry] = { days, hours, mins, secs };
  }

  getScheduleIcon(remark: string): string {
    const lower = remark.toLowerCase();
    if (lower.includes('dairy') || lower.includes('milk')) return '🥛';
    if (lower.includes('produce') || lower.includes('vegetable') || lower.includes('fruit')) return '🥬';
    if (lower.includes('bakery') || lower.includes('bread')) return '🍞';
    if (lower.includes('meat') || lower.includes('poultry')) return '🥩';
    if (lower.includes('bulk') || lower.includes('monthly')) return '📦';
    return '🛒';
  }

  getScheduleColor(index: number): string {
    const colors = [
      'from-emerald-50 to-teal-50',
      'from-blue-50 to-indigo-50',
      'from-amber-50 to-orange-50',
      'from-purple-50 to-pink-50'
    ];
    return colors[index % colors.length];
  }

  getScheduleAccent(index: number): string {
    const accents = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
    return accents[index % accents.length];
  }

  // Fisher-Yates shuffle algorithm
  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getVendorGradient(index: number): string {
    return this.vendorGradients[index % this.vendorGradients.length];
  }
}
