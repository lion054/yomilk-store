import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features-strip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-strip.component.html',
  styleUrls: ['./features-strip.component.scss']
})
export class FeaturesStripComponent {
  features = [
    {
      icon: '🚚',
      title: 'Free Delivery',
      description: 'Orders over $50'
    },
    {
      icon: '💰',
      title: 'Best Prices',
      description: 'Guaranteed savings'
    },
    {
      icon: '🎁',
      title: 'Daily Deals',
      description: 'Up to 50% off'
    },
    {
      icon: '🛡️',
      title: 'Secure Payment',
      description: '100% protected'
    },
    {
      icon: '🔄',
      title: 'Easy Returns',
      description: '30 day guarantee'
    }
  ];
}
