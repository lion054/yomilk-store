import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

declare let fbq: Function;

@Injectable({
  providedIn: 'root'
})
export class MetaPixelService {

  constructor() { }

  /**
   * Initializes the Facebook Pixel with the pixel ID from environment.
   */
  init(): void {
    fbq('init', environment.pixelId);
    fbq('track', 'PageView');
  }

  /**
   * Tracks a PageView event.
   */
  trackPageView(): void {
    fbq('track', 'PageView');
  }

  /**
   * Tracks a ViewContent event.
   * @param contentName - Name of the content viewed.
   * @param contentCategory - Category of the content viewed.
   */
  trackViewContent(contentName?: string, contentCategory?: string): void {
    fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: contentCategory
    });
  }

  /**
   * Tracks an AddToCart event.
   * @param contentName - Name of the product added to cart.
   * @param value - Value of the product.
   * @param currency - Currency code (e.g., 'USD').
   */
  trackAddToCart(contentName: string, value: number, currency: string): void {
    fbq('track', 'AddToCart', {
      content_name: contentName,
      value: value,
      currency: currency
    });
  }

  /**
   * Tracks a Purchase event.
   * @param value - Total value of the purchase.
   * @param currency - Currency code (e.g., 'USD').
   * @param contentName - Optional name of the content purchased.
   */
  trackPurchase(value: number, currency: string, contentName?: string): void {
    fbq('track', 'Purchase', {
      value: value,
      currency: currency,
      content_name: contentName
    });
  }
}
