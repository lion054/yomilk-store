import { Component } from '@angular/core';
import {GoogleAnalyticsService} from "../../core/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-news-letter',
  standalone: true,
  imports: [],
  templateUrl: './news-letter.component.html',
  styleUrl: './news-letter.component.css'
})
export class NewsLetterComponent {

  constructor(private googleAnalyticsService: GoogleAnalyticsService) {}

  onSubscribe() {
    this.googleAnalyticsService.trackEvent('newsletter_signup', {
      event_category: 'engagement',
      event_label: 'newsletter_subscription'
    });
  }

}
