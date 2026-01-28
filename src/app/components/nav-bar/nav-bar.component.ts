import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  @Output() categoriesClick = new EventEmitter<void>();

  showCategoriesDropdown = false;

  navLinks = [
    { label: 'Home', link: '/' },
    { label: 'Shop', link: '/store' },
    { label: 'Vendors', link: '/vendors' },
    { label: 'About', link: '/about-us' },
    { label: 'Contact', link: '/contact-us' }
  ];

  hotline = {
    phone: '+263 78 123 4567',
    label: '24/7 Support'
  };

  toggleCategories(): void {
    this.showCategoriesDropdown = !this.showCategoriesDropdown;
    this.categoriesClick.emit();
  }
}
