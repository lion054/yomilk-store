import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DialogConfig {
  title: string;
  message: string;
  type?: 'confirm' | 'warning' | 'danger' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export interface DialogState {
  isOpen: boolean;
  config: DialogConfig | null;
  resolve: ((value: boolean) => void) | null;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private state$ = new BehaviorSubject<DialogState>({
    isOpen: false,
    config: null,
    resolve: null
  });

  public dialog$ = this.state$.asObservable();

  confirm(config: DialogConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.state$.next({
        isOpen: true,
        config: {
          ...config,
          type: config.type || 'confirm',
          confirmText: config.confirmText || 'Confirm',
          cancelText: config.cancelText || 'Cancel',
          showCancel: config.showCancel !== false
        },
        resolve
      });
    });
  }

  danger(title: string, message: string): Promise<boolean> {
    return this.confirm({
      title,
      message,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
  }

  warning(title: string, message: string): Promise<boolean> {
    return this.confirm({
      title,
      message,
      type: 'warning',
      confirmText: 'Continue',
      cancelText: 'Cancel'
    });
  }

  alert(title: string, message: string): Promise<boolean> {
    return this.confirm({
      title,
      message,
      type: 'info',
      confirmText: 'OK',
      showCancel: false
    });
  }

  close(result: boolean): void {
    const state = this.state$.getValue();
    if (state.resolve) {
      state.resolve(result);
    }
    this.state$.next({
      isOpen: false,
      config: null,
      resolve: null
    });
  }
}
