import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { FeaturesStripComponent } from '../../components/features-strip/features-strip.component';

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BreadcrumbComponent,
    FeaturesStripComponent
  ],
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss']
})
export class VendorsComponent implements OnInit {
  searchTerm = '';
  selectedCategory = '';
  selectedRating = '';

  breadcrumbItems = [
    { label: 'Home', link: '/', icon: 'fas fa-home' },
    { label: 'Vendors' }
  ];

  categories = [
    'All Categories',
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Bakery',
    'Beverages',
    'Snacks',
    'Organic'
  ];

  vendors = [
    {
      id: 1,
      name: "Nature's Farm",
      logo: '🥬',
      rating: 5.0,
      reviewCount: 256,
      since: 2018,
      products: 256,
      positive: 98,
      orders: '4.5K',
      address: '123 Farm Road, Harare, Zimbabwe',
      badge: 'featured',
      description: 'Premium organic fruits and vegetables from local farms',
      categories: ['Fruits & Vegetables', 'Organic']
    },
    {
      id: 2,
      name: 'Dairy Delights',
      logo: '🥛',
      rating: 4.8,
      reviewCount: 189,
      since: 2015,
      products: 89,
      positive: 96,
      orders: '8.2K',
      address: '45 Dairy Lane, Bulawayo, Zimbabwe',
      badge: 'verified',
      description: 'Fresh dairy products delivered daily',
      categories: ['Dairy & Eggs']
    },
    {
      id: 3,
      name: 'Prime Cuts',
      logo: '🥩',
      rating: 5.0,
      reviewCount: 312,
      since: 2012,
      products: 124,
      positive: 99,
      orders: '12.8K',
      address: '78 Butcher Street, Harare, Zimbabwe',
      badge: 'featured',
      description: 'Premium quality meat and seafood',
      categories: ['Meat & Seafood']
    },
    {
      id: 4,
      name: 'Golden Bakery',
      logo: '🍞',
      rating: 4.2,
      reviewCount: 145,
      since: 2020,
      products: 67,
      positive: 94,
      orders: '2.1K',
      address: '12 Baker Avenue, Mutare, Zimbabwe',
      badge: 'verified',
      description: 'Freshly baked goods every morning',
      categories: ['Bakery']
    },
    {
      id: 5,
      name: 'Citrus Valley',
      logo: '🍊',
      rating: 4.6,
      reviewCount: 178,
      since: 2017,
      products: 45,
      positive: 95,
      orders: '3.8K',
      address: '56 Orange Grove, Gweru, Zimbabwe',
      badge: 'verified',
      description: 'Fresh citrus fruits and juices',
      categories: ['Fruits & Vegetables', 'Beverages']
    },
    {
      id: 6,
      name: 'Green Valley Organics',
      logo: '🌿',
      rating: 4.9,
      reviewCount: 234,
      since: 2016,
      products: 178,
      positive: 98,
      orders: '6.7K',
      address: '89 Green Street, Harare, Zimbabwe',
      badge: 'featured',
      description: 'Certified organic produce and health foods',
      categories: ['Organic', 'Fruits & Vegetables']
    },
    {
      id: 7,
      name: 'Snack Attack',
      logo: '🍿',
      rating: 4.4,
      reviewCount: 98,
      since: 2021,
      products: 156,
      positive: 92,
      orders: '1.5K',
      address: '23 Snack Lane, Bulawayo, Zimbabwe',
      badge: 'new',
      description: 'Wide variety of snacks and treats',
      categories: ['Snacks']
    },
    {
      id: 8,
      name: 'Ocean Fresh',
      logo: '🐟',
      rating: 4.7,
      reviewCount: 167,
      since: 2014,
      products: 78,
      positive: 97,
      orders: '5.2K',
      address: '34 Harbor Road, Harare, Zimbabwe',
      badge: 'verified',
      description: 'Fresh seafood and fish products',
      categories: ['Meat & Seafood']
    }
  ];

  filteredVendors = [...this.vendors];

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  filterVendors(): void {
    this.filteredVendors = this.vendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           vendor.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory ||
                              this.selectedCategory === 'All Categories' ||
                              vendor.categories.includes(this.selectedCategory);
      const matchesRating = !this.selectedRating ||
                           vendor.rating >= parseFloat(this.selectedRating);

      return matchesSearch && matchesCategory && matchesRating;
    });
  }

  onSearchChange(): void {
    this.filterVendors();
  }

  onCategoryChange(): void {
    this.filterVendors();
  }

  onRatingChange(): void {
    this.filterVendors();
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : (i < rating ? 0.5 : 0));
  }
}
