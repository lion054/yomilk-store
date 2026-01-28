import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../core/services/theme/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="toggleTheme()"
      class="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
      [ngClass]="isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'"
      [attr.aria-label]="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      title="{{ isDark ? 'Light mode' : 'Dark mode' }}"
    >
      <!-- Sun Icon -->
      <i
        class="fas fa-sun absolute transition-all duration-300"
        [ngClass]="isDark ? 'opacity-0 rotate-90 scale-0 text-yellow-300' : 'opacity-100 rotate-0 scale-100 text-yellow-500'"
      ></i>
      <!-- Moon Icon -->
      <i
        class="fas fa-moon absolute transition-all duration-300"
        [ngClass]="isDark ? 'opacity-100 rotate-0 scale-100 text-blue-300' : 'opacity-0 -rotate-90 scale-0 text-gray-600'"
      ></i>
    </button>
  `
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  isDark = false;
  private subscription?: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.isDark = this.themeService.isDarkMode();
    this.subscription = this.themeService.theme$.subscribe(() => {
      this.isDark = this.themeService.isDarkMode();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
