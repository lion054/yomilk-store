import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-product-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent],
  template: `
    <div class="w-full bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden animate-pulse">
      <!-- Image skeleton -->
      <div class="aspect-square bg-gray-200 relative">
        <app-skeleton-loader [width]="'100%'" [height]="'100%'" [variant]="'rounded-lg'"></app-skeleton-loader>
      </div>

      <!-- Content skeleton -->
      <div class="p-4 space-y-3">
        <!-- Price -->
        <app-skeleton-loader [width]="'80px'" [height]="'28px'" [variant]="'rounded'"></app-skeleton-loader>

        <!-- Title lines -->
        <div class="space-y-2">
          <app-skeleton-loader [width]="'100%'" [height]="'16px'" [variant]="'rounded'"></app-skeleton-loader>
          <app-skeleton-loader [width]="'70%'" [height]="'16px'" [variant]="'rounded'"></app-skeleton-loader>
        </div>

        <!-- Button -->
        <app-skeleton-loader [width]="'100%'" [height]="'40px'" [variant]="'rounded-lg'"></app-skeleton-loader>
      </div>
    </div>
  `
})
export class ProductSkeletonComponent {}
