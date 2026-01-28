import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Product Card Skeleton -->
    <div class="w-full bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100/50 animate-pulse">
      <!-- Image Section Skeleton -->
      <div class="aspect-square bg-gradient-to-br from-gray-200 to-gray-100 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shimmer"></div>
      </div>

      <!-- Content Section Skeleton -->
      <div class="p-4 space-y-3">
        <!-- Price Skeleton -->
        <div class="h-6 w-24 bg-gray-200 rounded-lg relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shimmer"></div>
        </div>

        <!-- Title Skeleton -->
        <div class="space-y-2">
          <div class="h-4 w-full bg-gray-200 rounded relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shimmer"></div>
          </div>
          <div class="h-4 w-3/4 bg-gray-200 rounded relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shimmer"></div>
          </div>
        </div>

        <!-- Button Skeleton -->
        <div class="pt-2">
          <div class="h-10 w-full bg-gray-200 rounded-xl relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-shimmer {
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class ProductSkeletonComponent {
  @Input() count: number = 1;
}

@Component({
  selector: 'app-skeleton-grid',
  standalone: true,
  imports: [CommonModule, ProductSkeletonComponent],
  template: `
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <app-product-skeleton *ngFor="let item of items"></app-product-skeleton>
    </div>
  `
})
export class SkeletonGridComponent {
  @Input() count: number = 10;

  get items(): number[] {
    return Array(this.count).fill(0);
  }
}
