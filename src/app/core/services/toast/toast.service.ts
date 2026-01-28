import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  public toasts = this.toasts$.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  show(toast: Omit<Toast, 'id'>): string {
    const id = this.generateId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000
    };

    this.toasts$.next([...this.toasts$.getValue(), newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => this.dismiss(id), newToast.duration);
    }

    return id;
  }

  success(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'error', title, message, duration: duration ?? 6000 });
  }

  warning(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'info', title, message, duration });
  }

  dismiss(id: string): void {
    this.toasts$.next(this.toasts$.getValue().filter(t => t.id !== id));
  }

  dismissAll(): void {
    this.toasts$.next([]);
  }
}
