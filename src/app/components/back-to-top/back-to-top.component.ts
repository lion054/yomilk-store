import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      *ngIf="isVisible"
      [@fadeSlide]
      (click)="scrollToTop()"
      class="fixed bottom-[120px] right-6 z-50 w-11 h-11 bg-white border border-gray-200 hover:bg-gray-50 text-[#42af57] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      aria-label="Scroll to top"
      title="Back to top"
    >
      <i class="fas fa-arrow-up text-base group-hover:-translate-y-0.5 transition-transform"></i>
    </button>
  `,
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ]
})
export class BackToTopComponent {
  isVisible = false;
  private scrollThreshold = 400;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isVisible = window.scrollY > this.scrollThreshold;
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
