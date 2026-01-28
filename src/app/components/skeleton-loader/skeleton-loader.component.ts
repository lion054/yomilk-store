import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getSkeletonClass()" [style.width]="width" [style.height]="height">
      <div class="animate-shimmer-bg"></div>
    </div>
  `,
  styles: [`
    .animate-shimmer-bg {
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        rgba(240, 240, 240, 0) 0%,
        rgba(240, 240, 240, 0.5) 50%,
        rgba(240, 240, 240, 0) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    .skeleton-base {
      position: relative;
      overflow: hidden;
      background-color: #e5e7eb;
    }

    .skeleton-rounded {
      border-radius: 8px;
    }

    .skeleton-rounded-lg {
      border-radius: 16px;
    }

    .skeleton-circle {
      border-radius: 50%;
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() width: string = '100%';
  @Input() height: string = '20px';
  @Input() variant: 'default' | 'rounded' | 'rounded-lg' | 'circle' = 'default';

  getSkeletonClass(): string {
    const baseClass = 'skeleton-base';
    const variantClass = this.variant === 'circle' ? 'skeleton-circle' :
                        this.variant === 'rounded-lg' ? 'skeleton-rounded-lg' :
                        this.variant === 'rounded' ? 'skeleton-rounded' : '';
    return `${baseClass} ${variantClass}`;
  }
}
