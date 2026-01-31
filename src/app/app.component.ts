import {Component, OnInit} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import {HeaderComponent} from "./components/header/header.component";
import {FooterComponent} from "./components/footer/footer.component";
import {AuthService} from "./core/services/auth/auth.service";
import {CurrencyService} from "./core/services/currency/currency.service";
import {
  trigger,
  state,
  style,
  animate,
  transition,} from "@angular/animations";
import {StoreService} from "./core/services/store/store.service";
import {LocalService} from "./core/services/local/local.service";
import {LoaderComponent} from "./components/loader-comp/loader-comp.component";
import {WhatsAppComponent} from "./components/whats-app/whats-app.component";
import {MetaPixelService} from "./core/services/meta-pixel/meta-pixel.service";
import {GoogleAnalyticsService} from "./core/services/google-analytics/google-analytics.service";
import {ConsentBannerComponent} from "./components/consent-banner/consent-banner.component";
import {FloatingCartComponent} from "./components/floating-cart/floating-cart.component";
import {SeoService} from "./core/services/seo/seo.service";

import {filter} from "rxjs/operators";
import {ToastComponent} from "./components/toast/toast.component";
import {DialogComponent} from "./components/dialog/dialog.component";
import {BackToTopComponent} from "./components/back-to-top/back-to-top.component";
import {SkipLinkComponent} from "./components/skip-link/skip-link.component";
import {ThemeService} from "./core/services/theme/theme.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    WhatsAppComponent,
    ConsentBannerComponent,
    FloatingCartComponent,
    ToastComponent,
    DialogComponent,
    BackToTopComponent,
    SkipLinkComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('1000ms ease-in-out', style({ opacity: 100}))
      ])
    ])
    // animation triggers go here
  ],
})
export class AppComponent implements OnInit{
  title = 'yomix';
  isB2bRoute = false;

  constructor(
    private authService: AuthService,
    private currencyService: CurrencyService,
    private storeService: StoreService,
    private localService: LocalService,
    private metaPixelService: MetaPixelService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private seoService: SeoService,
    private router: Router
  ) {
    // Check initial route
    this.isB2bRoute = this.router.url.startsWith('/b2b');

    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isB2bRoute = event.urlAfterRedirects.startsWith('/b2b');
    });
  }

  ngOnInit(): void {
    // this.authService.getCashCustomerSession().subscribe((response: any) => {
    //   // this.currencyService.getCurrencies().subscribe(
    //   //   (response: any) => {
    //   //
    //   //   }, (error: any) => {
    //   //
    //   //   })
    //   // this.storeService.getItemGroups();
    // })

    this.currencyService.getCurrencies().subscribe(
      (response: any) => {

      }, (error: any) => {

      })
    // Subscribe to getItemGroups to trigger the API call and populate storeCategories$
    this.storeService.getItemGroups(50, 1, '', '').subscribe();
    this.metaPixelService.init();
    this.googleAnalyticsService.init();

  }
}
