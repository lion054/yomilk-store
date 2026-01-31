import {AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";

import {AuthService} from "../../core/services/auth/auth.service";

@Component({
  selector: 'app-hero-cta',
  standalone: true,
  imports: [
    RouterLink
],
  templateUrl: './hero-cta.component.html',
  styleUrl: './hero-cta.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeroCTAComponent implements OnInit, AfterViewInit, OnDestroy{

  authenticated: boolean = false;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Component initialization
    this.authenticated = this.authService.getAuthUser().customer?.isVisitor? false : !this.authService.getAuthUser().customer?.isVisitor;
  }

  ngAfterViewInit(): void {
    // Initialize Swiper if needed
    this.initializeSwiper();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeSwiper(): void {
    // Swiper web components auto-initialize
    // Add any custom configuration here if needed
    const swiperEl = document.querySelector('swiper-container');
    if (swiperEl) {
      // Custom swiper configuration can be added here
      Object.assign(swiperEl, {
        slidesPerView: 1,
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        effect: 'fade',
        speed: 1000,
      });
    }
  }

  onShopNow(): void {
    // Navigate to shop page
    console.log('Navigate to shop');
  }

  onLearnMore(): void {
    // Navigate to about page or scroll to content
    console.log('Learn more clicked');
  }
}
