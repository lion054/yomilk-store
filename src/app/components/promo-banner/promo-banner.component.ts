import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './promo-banner.component.html',
  styleUrl: './promo-banner.component.scss'
})
export class PromoBannerComponent {
  @Input() title: string = 'Fresh Deals';
  @Input() subtitle: string = 'Quality products at great prices';
  @Input() currentPrice: string = '$19.99';
  @Input() originalPrice: string = '$29.99';
  @Input() saveAmount: string = '10';
  @Input() imageUrl: string = 'assets/images/delivery-card.png';
  @Input() linkUrl: string = '/store';
  @Input() variant: 'fresh' | 'coral' | 'dark' = 'fresh';

  get gradientClass(): string {
    switch (this.variant) {
      case 'coral':
        return 'from-coral-500 to-coral-600';
      case 'dark':
        return 'from-fresh-800 to-fresh-900';
      default:
        return 'from-fresh-600 to-fresh-700';
    }
  }
}
