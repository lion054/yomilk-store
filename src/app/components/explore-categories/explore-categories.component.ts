import { Component, OnInit } from '@angular/core';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-explore-categories',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './explore-categories.component.html',
  styleUrls: ['./explore-categories.component.scss']
})
export class ExploreCategoriesComponent implements OnInit {
  categories = [
    {
      id: 1,
      name: 'Fruits',
      icon: '🍊',
      count: 291,
      bgColor: '#ECFCCB',
      textColor: '#4D7C0F',
      link: '/store?category=fruits'
    },
    {
      id: 2,
      name: 'Cold Drinks',
      icon: '🥤',
      count: 49,
      bgColor: '#E0E7FF',
      textColor: '#4338CA',
      link: '/store?category=beverages'
    },
    {
      id: 3,
      name: 'Bakery',
      icon: '🧁',
      count: 108,
      bgColor: '#FEF3C7',
      textColor: '#92400E',
      link: '/store?category=bakery'
    },
    {
      id: 4,
      name: 'Vegetables',
      icon: '🥕',
      count: 485,
      bgColor: '#DBEAFE',
      textColor: '#1E40AF',
      link: '/store?category=vegetables'
    },
    {
      id: 5,
      name: 'Dairy',
      icon: '🥛',
      count: 156,
      bgColor: '#F3E8FF',
      textColor: '#6B21A8',
      link: '/store?category=dairy'
    },
    {
      id: 6,
      name: 'Meat',
      icon: '🥩',
      count: 73,
      bgColor: '#FEE2E2',
      textColor: '#991B1B',
      link: '/store?category=meat'
    },
    {
      id: 7,
      name: 'Snacks',
      icon: '🍿',
      count: 234,
      bgColor: '#FFEDD5',
      textColor: '#9A3412',
      link: '/store?category=snacks'
    },
    {
      id: 8,
      name: 'Seafood',
      icon: '🐟',
      count: 62,
      bgColor: '#CFFAFE',
      textColor: '#155E75',
      link: '/store?category=seafood'
    }
  ];

  ngOnInit(): void {}
}
