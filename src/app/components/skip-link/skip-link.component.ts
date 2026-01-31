import { Component } from '@angular/core';


@Component({
  selector: 'app-skip-link',
  standalone: true,
  imports: [],
  template: `
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:px-6 focus:py-3 focus:bg-[#42af57] focus:text-white focus:rounded-xl focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#42af57]"
    >
      Skip to main content
    </a>
  `
})
export class SkipLinkComponent {}
