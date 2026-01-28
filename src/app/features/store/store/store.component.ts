import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProductCardComponent} from "../../../components/products/product-card/product-card.component";
import {CommonModule} from "@angular/common";
import {FormsModule, NgForm} from "@angular/forms";
import {CategoryListComponent} from "../../../components/category-list/category-list.component";
import {CurrencyService} from "../../../core/services/currency/currency.service";
import {StoreService} from "../../../core/services/store/store.service";
import {ActivatedRoute, Router} from "@angular/router";
import {GoogleAnalyticsService} from "../../../core/services/google-analytics/google-analytics.service";
import {SeoService} from "../../../core/services/seo/seo.service";
import {Subject, debounceTime, distinctUntilChanged, filter, takeUntil} from 'rxjs';
import {BreadcrumbComponent} from "../../../components/breadcrumb/breadcrumb.component";
import {FeaturesStripComponent} from "../../../components/features-strip/features-strip.component";

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [
    ProductCardComponent,
    CommonModule,
    FormsModule,
    CategoryListComponent,
    BreadcrumbComponent,
    FeaturesStripComponent
  ],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent implements OnInit, OnDestroy{

  products:any = [];
  pageNumber:any = 1;
  pageSize:number = 50;
  totalPages:number = 0;
  searchTerm: string = '';
  loading: boolean = false;
  isError: boolean = false;
  isTriggered: boolean = false;
  clearGroup:boolean = false;

  arr = Array(10)
  private activeCurrency: any;
  filterExtension: any;
  group:any
   itemGroups: any;
   activeItemGroup:any = "";
   currentCategoryName: string = 'Shop';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();


  constructor(
    private storeService: StoreService,
    private currencyService: CurrencyService,
    private route: ActivatedRoute,
    private router: Router,
    private googleAnalyticsService: GoogleAnalyticsService,
    private seoService: SeoService
  ) {}

  updateRouteParams() {
    // Merge current parameters with the new one
    this.isTriggered = true;

    if(this.clearGroup) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { category: Number(this.activeItemGroup), group: ''},
        queryParamsHandling: 'merge', // to merge with existing params
      });
    }else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { category: Number(this.activeItemGroup)},
        queryParamsHandling: 'merge', // to merge with existing params
      });
    }


  }

  ngOnInit() {
    window.scrollTo(0, 0);

    // Set up reactive search
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(term => term.length >= 3 || term.length === 0),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.fetchProducts();
    });

    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['queryExtension'] || '';
      // this.filterExtension = params['category'];
      // this.activeItemGroup = this.filterExtension?? '';

      this.filterExtension = params['category'];
      this.group = params['group'] ?? '';
      this.activeItemGroup = this.filterExtension ? Number(this.filterExtension) : '';
      // You can now use this.queryExtension in your component
      console.log('Search query:', this.searchTerm);
      console.log('New active item group', this.activeItemGroup);
      // Perform any search or data fetching based on this queryExtension

      if(!this.isTriggered){
        this.currencyService.selectedCurrency$.subscribe(currency => {
          this.activeCurrency = currency;


          this.storeService.getItemGroups().subscribe((response:any) => {
            this.itemGroups = response;
            // // this.activeItemGroup = this.itemGroups.find((item:any)=> item['number'] === this.filterExtension);
            // this.fetchProducts();
            this.itemGroups = response;
            const matchedGroup = this.itemGroups.find((item: any) => item.number.toString() === this.filterExtension);
            // this.activeItemGroup = matchedGroup ? matchedGroup.number : '';
            this.currentCategoryName = matchedGroup ? matchedGroup.name : 'Shop';
            this.fetchProducts();
          })
        })
      }



    });




  }

  fetchProducts() {
    this.isError = false;
    this.loading = true;
    this.updateRouteParams()
    let searchString = this.searchTerm
    if(this.searchTerm && this.activeItemGroup != 0){
       searchString = `$filter = contains(ItemName, '${this.searchTerm}') [] ItemsGroupCode eq ${this.activeItemGroup}`
    }else if (this.searchTerm) {
      searchString = `$filter = contains(ItemName, '${this.searchTerm}')`
    }else if (this.activeItemGroup != 0){
      searchString = `$filter = ItemsGroupCode eq ${this.activeItemGroup}`
    } else {
      this.filterExtension = ''
    }



    console.log("FILTER EXTENSION",this.filterExtension);
    this.storeService.getStoreItems(this.activeCurrency.code, this.pageSize, this.pageNumber, "", searchString).subscribe(
      (response: any) => {
        this.loading = false;

        //FILTER PRODUCTS BASED ON GROUP
          let filteredProducts:any = this.filterProducts(response.values, this.group)

          this.products = filteredProducts;

        this.totalPages = response.pageCount
        this.clearGroup = true;
      },
      (error:any) => {
        console.log(error);
        this.loading = false;
        this.isError = true;
      }
    )
  }

  goToPreviousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.fetchProducts(); // Load invoices for the new page number
    }
  }

  // Method for navigating to the next page


  goToNextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.fetchProducts(); // Load invoices for the new page number
    }
  }


  private filterProducts(values: any[], group: string) {
    console.log("Filtering products for group:", group);
    const filterList:any = {
      'BREAD': [{ "number": 118, "groupName": "BREAD" }],
      'DAIRY': [
        { "number": 109, "groupName": "CHEESE PRODUCT" },
        { "number": 112, "groupName": "FRESH CREAM" },
        { "number": 111, "groupName": "FRESH MILK PRODUCT" },
        { "number": 121, "groupName": "LIFE" },
        { "number": 107, "groupName": "YOGHURT PRODUCT" },
        { "number": 108, "groupName": "YOLAC PRODUCT" }
      ],
      'CHEMICALS': [
        {
          "number": 123,
          "groupName": "HOMECARE"
        }
      ],
      'MEAT': [],
      'GROCERIES': [],

    };


    if (!filterList[group]) return values // Return empty if group is invalid

    console.log("Filter list for group:", filterList[group]);

    let filteredProducts = values.filter((item: any) =>
      filterList[group].some((entry:any) => entry.number === item.itemsGroupCode)
    );
    console.log("Filtered products:", filteredProducts);

    return filteredProducts;
  }

  //  filterProducts(values:any, group:any) {
  //   console.log("Filtering products for group:", group);
  //
  //   const filterList:any = {
  //     BREAD: [
  //       { number: 118, groupName: "BREAD" },
  //     ],
  //     DAIRY: [
  //       { number: 109, groupName: "CHEESE PRODUCT" },
  //       { number: 112, groupName: "FRESH CREAM" },
  //       { number: 111, groupName: "FRESH MILK PRODUCT" },
  //       { number: 121, groupName: "LIFE" },
  //       { number: 107, groupName: "YOGHURT PRODUCT" },
  //       { number: 108, groupName: "YOLAC PRODUCT" },
  //     ],
  //     CHEMICALS: [
  //       { number: 123, groupName: "HOMECARE" },
  //     ],
  //     MEAT:     [],
  //     GROCERIES:[],
  //   };
  //
  //   // if the group key doesn't exist, return empty array
  //   if (!(group in filterList)) {
  //     console.warn(`Unknown group "${group}". Returning empty list.`);
  //     return [];
  //   }
  //
  //   // build a Set of allowed codes for fast lookups
  //   const allowedCodes = new Set(
  //     filterList[group].map((entry:any) => entry.number)
  //   );
  //   console.log("Allowed codes for group:", Array.from(allowedCodes));
  //
  //   // filter the products
  //   const result = values.filter((item:any) =>
  //     allowedCodes.has(item.itemsGroupCode)
  //   );
  //   console.log("Filtered products:", result);
  //
  //   return result;
  // }


  search() {
      this.googleAnalyticsService.trackEvent('search', {
        event_category: 'engagement',
        event_label: 'search_performed',
        search_term: this.searchTerm
      });
      this.fetchProducts()
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
  }

  setActiveItemGroup(activeGroup: any) {
    this.activeItemGroup = activeGroup;
    // Set category-specific SEO
    if (activeGroup && this.itemGroups) {
      const selectedGroup = this.itemGroups.find((g: any) => g.number === activeGroup);
      if (selectedGroup) {
        this.seoService.setCategorySeo(selectedGroup.groupName);
      }
    }
    this.fetchProducts()
  }

  trackByGroupNumber(index: number, group: any): any {
    return group.number;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
