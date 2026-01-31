import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  icon: string;
  description: string;
  available: boolean;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, FormsModule, BreadcrumbComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  breadcrumbItems = [
    { label: 'Home', link: '/' },
    { label: 'Services', link: '/services' }
  ];

  activeCategory: string = 'airtime';
  searchQuery: string = '';

  serviceCategories: ServiceCategory[] = [
    {
      id: 'airtime',
      name: 'Airtime & Data',
      icon: '📱',
      description: 'Top up airtime and data bundles for all networks',
      services: [
        { id: 'econet-airtime', name: 'Econet Airtime', icon: '📞', description: 'Econet prepaid airtime top-up', available: true },
        { id: 'econet-data', name: 'Econet Data Bundles', icon: '📶', description: 'Econet internet data bundles', available: true },
        { id: 'netone-airtime', name: 'NetOne Airtime', icon: '📞', description: 'NetOne prepaid airtime top-up', available: true },
        { id: 'netone-data', name: 'NetOne Data Bundles', icon: '📶', description: 'NetOne internet data bundles', available: true },
        { id: 'telecel-airtime', name: 'Telecel Airtime', icon: '📞', description: 'Telecel prepaid airtime top-up', available: true },
        { id: 'telecel-data', name: 'Telecel Data Bundles', icon: '📶', description: 'Telecel internet data bundles', available: true }
      ]
    },
    {
      id: 'electricity',
      name: 'Electricity (ZESA)',
      icon: '⚡',
      description: 'Purchase ZESA prepaid electricity tokens',
      services: [
        { id: 'zesa-prepaid', name: 'ZESA Prepaid Tokens', icon: '🔌', description: 'Buy ZETDC prepaid electricity tokens instantly', available: true },
        { id: 'zesa-postpaid', name: 'ZESA Bill Payment', icon: '📄', description: 'Pay your ZESA postpaid electricity bill', available: true }
      ]
    },
    {
      id: 'tv',
      name: 'TV Subscriptions',
      icon: '📺',
      description: 'Pay for DStv, GOtv and other TV subscriptions',
      services: [
        { id: 'dstv', name: 'DStv Subscription', icon: '📺', description: 'Pay or renew your DStv subscription', available: true },
        { id: 'gotv', name: 'GOtv Subscription', icon: '📺', description: 'Pay or renew your GOtv subscription', available: true },
        { id: 'kwese', name: 'Kwese TV', icon: '📺', description: 'Pay or renew your Kwese subscription', available: false }
      ]
    },
    {
      id: 'water',
      name: 'Water & Utilities',
      icon: '💧',
      description: 'Pay water bills and other utility services',
      services: [
        { id: 'zinwa', name: 'ZINWA Water', icon: '💧', description: 'Pay ZINWA water bills', available: true },
        { id: 'harare-water', name: 'Harare City Water', icon: '💧', description: 'Pay Harare City Council water bills', available: true },
        { id: 'bulawayo-water', name: 'Bulawayo Water', icon: '💧', description: 'Pay Bulawayo City Council water bills', available: false }
      ]
    },
    {
      id: 'internet',
      name: 'Internet & WiFi',
      icon: '🌐',
      description: 'Pay for internet and WiFi services',
      services: [
        { id: 'telone', name: 'TelOne Internet', icon: '🌐', description: 'Pay TelOne broadband and fiber bills', available: true },
        { id: 'liquid', name: 'Liquid Telecom', icon: '🌐', description: 'Pay Liquid Telecom internet bills', available: true },
        { id: 'zol', name: 'ZOL Fibroniks', icon: '🌐', description: 'Pay ZOL fiber internet bills', available: true },
        { id: 'powertel', name: 'Powertel', icon: '🌐', description: 'Pay Powertel internet services', available: false }
      ]
    },
    {
      id: 'insurance',
      name: 'Insurance',
      icon: '🛡️',
      description: 'Pay insurance premiums',
      services: [
        { id: 'zimnat', name: 'Zimnat Insurance', icon: '🛡️', description: 'Pay Zimnat insurance premiums', available: false },
        { id: 'old-mutual', name: 'Old Mutual', icon: '🛡️', description: 'Pay Old Mutual insurance premiums', available: false },
        { id: 'nyaradzo', name: 'Nyaradzo', icon: '🛡️', description: 'Pay Nyaradzo funeral policy', available: true }
      ]
    },
    {
      id: 'education',
      name: 'Education',
      icon: '🎓',
      description: 'Pay school fees and educational services',
      services: [
        { id: 'school-fees', name: 'School Fees', icon: '🎓', description: 'Pay school and university fees', available: false },
        { id: 'exam-fees', name: 'ZIMSEC Fees', icon: '📝', description: 'Pay ZIMSEC examination fees', available: false }
      ]
    },
    {
      id: 'vouchers',
      name: 'Gift Vouchers',
      icon: '🎁',
      description: 'Purchase gift vouchers and cards',
      services: [
        { id: 'snappy-voucher', name: 'Snappy Fresh Voucher', icon: '🎁', description: 'Buy Snappy Fresh gift vouchers', available: true },
        { id: 'google-play', name: 'Google Play', icon: '▶️', description: 'Buy Google Play gift cards', available: false },
        { id: 'steam', name: 'Steam Wallet', icon: '🎮', description: 'Buy Steam wallet gift cards', available: false }
      ]
    }
  ];

  get filteredCategories(): ServiceCategory[] {
    if (!this.searchQuery.trim()) {
      return this.serviceCategories;
    }

    const query = this.searchQuery.toLowerCase();
    return this.serviceCategories.map(category => ({
      ...category,
      services: category.services.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      )
    })).filter(category => category.services.length > 0);
  }

  get activeServices(): Service[] {
    const category = this.serviceCategories.find(c => c.id === this.activeCategory);
    return category ? category.services : [];
  }

  get activeCategoryData(): ServiceCategory | undefined {
    return this.serviceCategories.find(c => c.id === this.activeCategory);
  }

  setActiveCategory(categoryId: string): void {
    this.activeCategory = categoryId;
  }

  selectService(service: Service): void {
    if (!service.available) {
      return;
    }
    // Navigate to specific service page or open modal
    console.log('Selected service:', service);
    // TODO: Implement service-specific flow
    alert(`${service.name} - Coming soon! This service will be available shortly.`);
  }
}
