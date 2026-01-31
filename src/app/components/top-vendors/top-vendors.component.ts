import { Component, OnInit } from '@angular/core';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-top-vendors',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './top-vendors.component.html',
  styleUrls: ['./top-vendors.component.scss']
})
export class TopVendorsComponent implements OnInit {
  topVendors = [
    {
      id: 1,
      name: "Nature's Farm",
      logo: '🥬',
      sales: 587,
      categories: [
        { name: 'Fruits', count: 5 },
        { name: 'Vegetables', count: 30 },
        { name: 'Snacks', count: 9 }
      ],
      rating: 5.0,
      badge: 'LOCAL SELLER'
    },
    {
      id: 2,
      name: 'Dairy Delights',
      logo: '🥛',
      sales: 428,
      categories: [
        { name: 'Dairy', count: 8 },
        { name: 'Beverages', count: 15 },
        { name: 'Snacks', count: 4 }
      ],
      rating: 4.8
    },
    {
      id: 3,
      name: 'Prime Cuts',
      logo: '🥩',
      sales: 1024,
      categories: [
        { name: 'Meat', count: 16 },
        { name: 'Seafood', count: 42 },
        { name: 'Poultry', count: 18 }
      ],
      rating: 5.0
    },
    {
      id: 4,
      name: 'Golden Bakery',
      logo: '🍞',
      sales: 210,
      categories: [
        { name: 'Bread', count: 2 },
        { name: 'Pastries', count: 10 },
        { name: 'Cakes', count: 3 }
      ],
      rating: 4.2
    }
  ];

  featuredVendor = this.topVendors[0];

  ngOnInit(): void {}
}
