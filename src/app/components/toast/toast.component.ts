import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast/toast.service';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate, state } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      >
      @for (toast of toasts; track trackById($index, toast)) {
        <div
          [@slideIn]
          class="pointer-events-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border overflow-hidden transform transition-all duration-300 hover:scale-[1.02]"
          [ngClass]="getBorderClass(toast.type)"
          role="alert"
          [attr.aria-label]="toast.title"
          >
          <div class="flex items-start gap-3 p-4">
            <!-- Icon -->
            <div
              class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              [ngClass]="getIconBgClass(toast.type)"
              >
              <i [class]="getIconClass(toast.type)" [ngClass]="getIconColorClass(toast.type)"></i>
            </div>
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ toast.title }}</p>
              @if (toast.message) {
                <p class="text-gray-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-2">
                  {{ toast.message }}
                </p>
              }
              @if (toast.action) {
                <button
                  (click)="handleAction(toast)"
                  class="mt-2 text-xs font-semibold hover:underline"
                  [ngClass]="getActionClass(toast.type)"
                  >
                  {{ toast.action.label }}
                </button>
              }
            </div>
            <!-- Close Button -->
            <button
              (click)="dismiss(toast.id)"
              class="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Dismiss notification"
              >
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
          <!-- Progress Bar -->
          <div class="h-1 bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              class="h-full transition-all ease-linear"
              [ngClass]="getProgressClass(toast.type)"
              [style.animation]="'shrink ' + (toast.duration || 4000) + 'ms linear forwards'"
            ></div>
          </div>
        </div>
      }
    </div>
    `,
  styles: [`
    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  trackById(index: number, toast: Toast): string {
    return toast.id;
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  handleAction(toast: Toast): void {
    toast.action?.callback();
    this.dismiss(toast.id);
  }

  getBorderClass(type: string): string {
    const classes: Record<string, string> = {
      success: 'border-green-200 dark:border-green-800',
      error: 'border-red-200 dark:border-red-800',
      warning: 'border-amber-200 dark:border-amber-800',
      info: 'border-blue-200 dark:border-blue-800'
    };
    return classes[type] || classes['info'];
  }

  getIconBgClass(type: string): string {
    const classes: Record<string, string> = {
      success: 'bg-green-100 dark:bg-green-900/30',
      error: 'bg-red-100 dark:bg-red-900/30',
      warning: 'bg-amber-100 dark:bg-amber-900/30',
      info: 'bg-blue-100 dark:bg-blue-900/30'
    };
    return classes[type] || classes['info'];
  }

  getIconClass(type: string): string {
    const classes: Record<string, string> = {
      success: 'fas fa-check',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return classes[type] || classes['info'];
  }

  getIconColorClass(type: string): string {
    const classes: Record<string, string> = {
      success: 'text-green-600 dark:text-green-400',
      error: 'text-red-600 dark:text-red-400',
      warning: 'text-amber-600 dark:text-amber-400',
      info: 'text-blue-600 dark:text-blue-400'
    };
    return classes[type] || classes['info'];
  }

  getActionClass(type: string): string {
    const classes: Record<string, string> = {
      success: 'text-green-600 hover:text-green-700',
      error: 'text-red-600 hover:text-red-700',
      warning: 'text-amber-600 hover:text-amber-700',
      info: 'text-blue-600 hover:text-blue-700'
    };
    return classes[type] || classes['info'];
  }

  getProgressClass(type: string): string {
    const classes: Record<string, string> = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-amber-500',
      info: 'bg-blue-500'
    };
    return classes[type] || classes['info'];
  }
}
