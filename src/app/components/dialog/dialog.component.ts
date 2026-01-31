import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DialogState } from '../../core/services/dialog/dialog.service';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (state.isOpen) {
      <div
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'dialog-title'"
        >
        <!-- Backdrop -->
        <div
          [@fadeIn]
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          (click)="onBackdropClick()"
        ></div>
        <!-- Dialog -->
        <div
          [@scaleIn]
          class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
          <!-- Header -->
          <div class="p-6 pb-4">
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div
                class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                [ngClass]="getIconBgClass()"
                >
                <i [class]="getIconClass()" [ngClass]="getIconColorClass()"></i>
              </div>
              <div class="flex-1">
                <h3
                  id="dialog-title"
                  class="text-lg font-bold text-gray-900 dark:text-white"
                  >
                  {{ state.config?.title }}
                </h3>
                <p class="mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {{ state.config?.message }}
                </p>
              </div>
            </div>
          </div>
          <!-- Actions -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
            @if (state.config?.showCancel) {
              <button
                (click)="close(false)"
                class="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                >
                {{ state.config?.cancelText }}
              </button>
            }
            <button
              (click)="close(true)"
              class="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              [ngClass]="getConfirmButtonClass()"
              #confirmButton
              >
              {{ state.config?.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
    `,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class DialogComponent implements OnInit, OnDestroy {
  state: DialogState = { isOpen: false, config: null, resolve: null };
  private subscription?: Subscription;

  constructor(private dialogService: DialogService) {}

  ngOnInit(): void {
    this.subscription = this.dialogService.dialog$.subscribe(state => {
      this.state = state;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.state.isOpen && this.state.config?.showCancel) {
      this.close(false);
    }
  }

  @HostListener('document:keydown.enter')
  onEnterKey(): void {
    if (this.state.isOpen) {
      this.close(true);
    }
  }

  onBackdropClick(): void {
    if (this.state.config?.showCancel) {
      this.close(false);
    }
  }

  close(result: boolean): void {
    this.dialogService.close(result);
  }

  getIconClass(): string {
    const type = this.state.config?.type || 'confirm';
    const icons: Record<string, string> = {
      confirm: 'fas fa-question-circle text-xl',
      warning: 'fas fa-exclamation-triangle text-xl',
      danger: 'fas fa-trash-alt text-xl',
      info: 'fas fa-info-circle text-xl'
    };
    return icons[type];
  }

  getIconBgClass(): string {
    const type = this.state.config?.type || 'confirm';
    const classes: Record<string, string> = {
      confirm: 'bg-blue-100 dark:bg-blue-900/30',
      warning: 'bg-amber-100 dark:bg-amber-900/30',
      danger: 'bg-red-100 dark:bg-red-900/30',
      info: 'bg-blue-100 dark:bg-blue-900/30'
    };
    return classes[type];
  }

  getIconColorClass(): string {
    const type = this.state.config?.type || 'confirm';
    const classes: Record<string, string> = {
      confirm: 'text-blue-600 dark:text-blue-400',
      warning: 'text-amber-600 dark:text-amber-400',
      danger: 'text-red-600 dark:text-red-400',
      info: 'text-blue-600 dark:text-blue-400'
    };
    return classes[type];
  }

  getConfirmButtonClass(): string {
    const type = this.state.config?.type || 'confirm';
    const classes: Record<string, string> = {
      confirm: 'bg-[#42af57] hover:bg-[#3d9332] focus:ring-[#42af57]',
      warning: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
      danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
      info: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
    };
    return classes[type];
  }
}
