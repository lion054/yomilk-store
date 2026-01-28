import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleAnalyticsService } from '../../core/services/google-analytics/google-analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-consent-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consent-banner.component.html'
})
export class ConsentBannerComponent implements OnInit {
  showBanner: boolean = false;
  private consentSubscription!: Subscription;
  private hasUserResponded: boolean = false;

  constructor(private gaService: GoogleAnalyticsService) {
    console.log("Initiating consent banner check.");
  }

  ngOnInit(): void {
    console.log("Initiating consent banner check.");
    this.consentSubscription = this.gaService.consentStatus$.subscribe(status => {
      console.log("Consent status received:", status, "hasUserResponded:", this.hasUserResponded);
      // Only show banner if consent hasn't been set yet AND user hasn't responded this session
      this.showBanner = status === null && !this.hasUserResponded;
      console.log("showBanner set to:", this.showBanner);
    });

    // local storage for consent
    // const consent = localStorage.getItem('ga_consent');
    // console.log("Consent status from localStorage:", consent);
    // this.showBanner = consent === null && !this.hasUserResponded;
    // console.log("showBanner set to:", this.showBanner);
  }


  accept(): void {
    console.log("Accept button clicked");
    this.hasUserResponded = true;
    this.gaService.setConsent(true);
    this.showBanner = false;
    console.log("Banner should now be hidden");
  }

  reject(): void {
    console.log("Reject button clicked");
    this.hasUserResponded = true;
    this.gaService.setConsent(false);
    this.showBanner = false;
    console.log("Banner should now be hidden");
  }
}
