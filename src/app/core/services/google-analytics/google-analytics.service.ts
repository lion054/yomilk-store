import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  private consentGranted: boolean = false;
  private gaLoaded: boolean = false;
  private consentStatusSubject = new BehaviorSubject<boolean | null>(null);
  public consentStatus$ = this.consentStatusSubject.asObservable();

  constructor() {
    this.initializeConsent();
  }

  private initializeConsent(): void {
    const storedConsent = localStorage.getItem('ga-consent');
    if (storedConsent !== null) {
      this.consentGranted = storedConsent === 'granted';
      if (this.consentGranted) {
        this.loadGoogleAnalytics();
      }
    }
    // Emit the initial consent status (null if not set, false if denied, true if granted)
    this.consentStatusSubject.next(storedConsent === null ? null : this.consentGranted);
  }

  private loadGoogleAnalytics(): void {
    if (this.gaLoaded) return;

    // Dynamically load the Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${environment.gaMeasurementId}`;
    document.head.appendChild(script1);

    // Initialize gtag
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('consent', 'default', {
        analytics_storage: 'denied'
      });
      gtag('config', '${environment.gaMeasurementId}');
    `;
    document.head.appendChild(script2);
    this.gaLoaded = true;
  }

  /**
   * Tracks a custom event.
   * @param eventName - The name of the event.
   * @param parameters - Optional parameters for the event.
   */
  trackEvent(eventName: string, parameters?: any): void {
    if (this.consentGranted) {
      gtag('event', eventName, parameters);
    }
  }

  /**
   * Tracks a page view.
   * @param pagePath - The path of the page.
   * @param pageTitle - Optional title of the page.
   */
  trackPageView(pagePath: string, pageTitle?: string): void {
    if (this.consentGranted) {
      gtag('config', environment.gaMeasurementId, {
        page_path: pagePath,
        page_title: pageTitle
      });
    }
  }

  /**
   * Tracks an ecommerce event.
   * @param eventName - The name of the ecommerce event.
   * @param items - Array of items involved in the event.
   * @param value - Optional total value.
   * @param currency - Optional currency code.
   */
  trackEcommerceEvent(eventName: string, items: any[], value?: number, currency?: string): void {
    if (this.consentGranted) {
      const params: any = {
        items: items
      };
      if (value !== undefined) {
        params.value = value;
      }
      if (currency !== undefined) {
        params.currency = currency;
      }
      gtag('event', eventName, params);
    }
  }

  /**
   * Sets the consent status for analytics.
   * @param granted - Whether consent is granted.
   */
  setConsent(granted: boolean): void {
    this.consentGranted = granted;
    localStorage.setItem('ga-consent', granted ? 'granted' : 'denied');
    if (granted && !this.gaLoaded) {
      this.loadGoogleAnalytics();
    }
    if (this.gaLoaded) {
      gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied'
      });
    }
    // Emit the updated consent status
    this.consentStatusSubject.next(granted);
  }

  /**
   * Initializes Google Analytics by tracking the initial page view.
   */
  init(): void {
    if (this.consentGranted) {
      this.trackPageView('/');
    }
  }

  /**
   * Gets the current consent status.
   * @returns The consent status.
   */
  getConsentStatus(): boolean {
    return this.consentGranted;
  }
}
