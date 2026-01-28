import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {FaqComponent} from "../faq/faq.component";
import {DeliveryZonesMapComponent} from "../../components/delivery-zones-map/delivery-zones-map.component";
import {BreadcrumbComponent} from "../../components/breadcrumb/breadcrumb.component";
import {FeaturesStripComponent} from "../../components/features-strip/features-strip.component";

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FaqComponent,
    DeliveryZonesMapComponent,
    BreadcrumbComponent,
    FeaturesStripComponent
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent implements OnInit {
  breadcrumbItems = [
    { label: 'Home', link: '/', icon: 'fas fa-home' },
    { label: 'Contact Us' }
  ];

  contactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  locations = [
    {
      name: 'Main Office - Harare',
      address: '185 Lorely Close, Msasa, Harare',
      phone: '+263 782 978 460',
      email: 'support@snappyfresh.net',
      hours: 'Mon-Sat: 8:00 AM - 6:00 PM',
      icon: '🏢'
    },
    {
      name: 'Operations Center',
      address: '123 Fresh Street, Harare',
      phone: '+263 779 822 686',
      email: 'operations@snappyfresh.net',
      hours: 'Mon-Sat: 6:00 AM - 8:00 PM',
      icon: '🚚'
    },
    {
      name: 'Customer Support',
      address: 'Online Support Available',
      phone: '+263 77 971 4936',
      email: 'help@snappyfresh.net',
      hours: '24/7 Available',
      icon: '💬'
    }
  ];

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  onSubmit(): void {
    console.log('Contact form submitted:', this.contactForm);
    // Handle form submission
  }
}
