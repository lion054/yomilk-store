import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart/cart.service';
import { Subject, takeUntil } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-floating-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('bounce', [
      state('normal', style({ transform: 'scale(1)' })),
      state('bounce', style({ transform: 'scale(1.2)' })),
      transition('normal => bounce', animate('150ms ease-out')),
      transition('bounce => normal', animate('150ms ease-in'))
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ])
  ],
  template: `
    <!-- Floating Cart Button - Only visible when cart has items -->
    <div *ngIf="itemCount > 0"
         @slideIn
         class="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3">

      <!-- Mini Cart Preview (on hover) -->
      <div class="hidden md:block opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
        <div class="bg-white rounded-2xl shadow-2xl p-4 w-72 border border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <span class="font-semibold text-gray-800">Your Cart</span>
            <span class="text-sm text-gray-500">{{ itemCount }} items</span>
          </div>
          <div class="text-lg font-bold text-[#42af57]">{{ cartTotal | currency }}</div>
        </div>
      </div>

      <!-- Main Floating Button -->
      <a routerLink="/cart"
         class="group relative flex items-center gap-3 bg-gradient-to-r from-[#42af57] to-[#4a9a48] hover:from-[#4a9a48] hover:to-[#3d9332] text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
         [@bounce]="bounceState">

        <!-- Pulse Ring Animation -->
        <div class="absolute inset-0 rounded-full bg-[#42af57] animate-ping opacity-20"></div>

        <!-- Button Content - Compact on mobile, expanded on hover -->
        <div class="relative z-10 flex items-center gap-3 px-4 py-3 md:pr-4">
          <!-- Cart Icon with Badge -->
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>

            <!-- Item Count Badge -->
            <span class="absolute -top-2 -right-2 w-5 h-5 bg-white text-[#42af57] text-xs font-bold rounded-full flex items-center justify-center shadow-md">
              {{ itemCount > 99 ? '99+' : itemCount }}
            </span>
          </div>

          <!-- Cart Total - Hidden on mobile, visible on larger screens -->
          <div class="hidden md:flex flex-col">
            <span class="text-xs opacity-80">Cart Total</span>
            <span class="font-bold text-sm">{{ cartTotal | currency }}</span>
          </div>

          <!-- Arrow Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden md:block opacity-70 group-hover:translate-x-1 transition-transform">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </div>
      </a>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class FloatingCartComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  itemCount = 0;
  cartTotal = 0;
  bounceState = 'normal';
  private previousCount = 0;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.cartItems$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(items => {
      this.itemCount = items.length;

      // Calculate cart total
      this.cartTotal = items.reduce((total: number, item: any) => {
        return total + (item.price * (item.quantity || 1));
      }, 0);

      // Trigger bounce animation when items are added
      if (this.itemCount > this.previousCount) {
        this.triggerBounce();
      }
      this.previousCount = this.itemCount;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  triggerBounce() {
    this.bounceState = 'bounce';
    setTimeout(() => {
      this.bounceState = 'normal';
    }, 150);
  }
}
