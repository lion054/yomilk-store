import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme$ = new BehaviorSubject<Theme>(this.getStoredTheme());
  public theme$ = this.currentTheme$.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initTheme();
    this.watchSystemPreference();
  }

  private getStoredTheme(): Theme {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  }

  private initTheme(): void {
    this.applyTheme(this.currentTheme$.getValue());
  }

  private watchSystemPreference(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.currentTheme$.getValue() === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }

  setTheme(theme: Theme): void {
    this.currentTheme$.next(theme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const current = this.currentTheme$.getValue();
    const isDark = this.isDarkMode();
    this.setTheme(isDark ? 'light' : 'dark');
  }

  isDarkMode(): boolean {
    const theme = this.currentTheme$.getValue();
    if (theme === 'system') {
      return typeof window !== 'undefined' &&
             window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }

  private applyTheme(theme: Theme): void {
    const isDark = theme === 'dark' ||
      (theme === 'system' && typeof window !== 'undefined' &&
       window.matchMedia?.('(prefers-color-scheme: dark)').matches);

    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  getCurrentTheme(): Theme {
    return this.currentTheme$.getValue();
  }
}
