import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { FeaturesStripComponent } from '../../components/features-strip/features-strip.component';

interface VendorFormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  businessType: string;
  productCategories: string[];
  description: string;
  hasBusinessLicense: boolean;
  acceptTerms: boolean;
}

@Component({
  selector: 'app-vendor-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbComponent,
    FeaturesStripComponent
  ],
  templateUrl: './vendor-onboarding.component.html',
  styleUrls: ['./vendor-onboarding.component.scss']
})
export class VendorOnboardingComponent implements OnInit {
  vendorForm!: FormGroup;
  currentStep = 1;
  totalSteps = 3;
  isSubmitting = false;
  isSubmitted = false;

  breadcrumbItems = [
    { label: 'Home', link: '/', icon: 'fas fa-home' },
    { label: 'Vendors', link: '/vendors' },
    { label: 'Become a Vendor' }
  ];

  businessTypes = [
    { value: 'farm', label: 'Farm / Agriculture', icon: '🌾' },
    { value: 'dairy', label: 'Dairy Products', icon: '🥛' },
    { value: 'bakery', label: 'Bakery', icon: '🍞' },
    { value: 'grocery', label: 'Grocery Store', icon: '🛒' },
    { value: 'meat', label: 'Meat & Poultry', icon: '🥩' },
    { value: 'organic', label: 'Organic Products', icon: '🌿' },
    { value: 'beverages', label: 'Beverages', icon: '🥤' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  productCategories = [
    { value: 'dairy', label: 'Dairy & Milk Products', selected: false },
    { value: 'bread', label: 'Bread & Bakery', selected: false },
    { value: 'meat', label: 'Meat & Seafood', selected: false },
    { value: 'fruits', label: 'Fruits & Vegetables', selected: false },
    { value: 'beverages', label: 'Beverages', selected: false },
    { value: 'snacks', label: 'Snacks & Confectionery', selected: false },
    { value: 'household', label: 'Household Items', selected: false },
    { value: 'personal', label: 'Personal Care', selected: false },
    { value: 'organic', label: 'Organic Products', selected: false },
    { value: 'frozen', label: 'Frozen Foods', selected: false }
  ];

  benefits = [
    {
      icon: 'fas fa-users',
      title: 'Reach More Customers',
      description: 'Access thousands of active buyers in Harare and beyond. Expand your customer base instantly.'
    },
    {
      icon: 'fas fa-truck',
      title: 'We Handle Delivery',
      description: 'Our logistics team handles all deliveries. Focus on what you do best - creating great products.'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Grow Your Business',
      description: 'Get insights into customer preferences and trends. Make data-driven decisions.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Secure Payments',
      description: 'Receive payments directly to your account. Multiple payment options for your customers.'
    },
    {
      icon: 'fas fa-headset',
      title: '24/7 Support',
      description: 'Our dedicated vendor support team is always ready to help you succeed.'
    },
    {
      icon: 'fas fa-percentage',
      title: 'Low Commission',
      description: 'Competitive commission rates. Keep more of what you earn.'
    }
  ];

  howItWorks = [
    {
      step: 1,
      title: 'Register',
      description: 'Fill out the vendor application form with your business details.',
      icon: 'fas fa-user-plus'
    },
    {
      step: 2,
      title: 'Verification',
      description: 'Our team reviews your application within 24-48 hours.',
      icon: 'fas fa-check-circle'
    },
    {
      step: 3,
      title: 'Setup Store',
      description: 'Once approved, set up your store and add your products.',
      icon: 'fas fa-store'
    },
    {
      step: 4,
      title: 'Start Selling',
      description: 'Go live and start receiving orders from customers!',
      icon: 'fas fa-rocket'
    }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.initForm();
  }

  initForm(): void {
    this.vendorForm = this.fb.group({
      // Step 1: Business Information
      businessName: ['', [Validators.required, Validators.minLength(3)]],
      ownerName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{9,15}$/)]],
      whatsapp: [''],

      // Step 2: Business Details
      address: ['', Validators.required],
      city: ['', Validators.required],
      businessType: ['', Validators.required],
      productCategories: [[]],
      description: ['', [Validators.required, Validators.minLength(50)]],

      // Step 3: Verification
      hasBusinessLicense: [false],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  get f() {
    return this.vendorForm.controls;
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.f['businessName'].valid &&
               this.f['ownerName'].valid &&
               this.f['email'].valid &&
               this.f['phone'].valid;
      case 2:
        return this.f['address'].valid &&
               this.f['city'].valid &&
               this.f['businessType'].valid &&
               this.f['description'].valid;
      case 3:
        return this.f['acceptTerms'].valid;
      default:
        return false;
    }
  }

  nextStep(): void {
    if (this.isStepValid(this.currentStep) && this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || this.isStepValid(this.currentStep)) {
      this.currentStep = step;
    }
  }

  toggleCategory(category: any): void {
    category.selected = !category.selected;
    const selectedCategories = this.productCategories
      .filter(c => c.selected)
      .map(c => c.value);
    this.vendorForm.patchValue({ productCategories: selectedCategories });
  }

  onSubmit(): void {
    if (this.vendorForm.valid) {
      this.isSubmitting = true;

      // Simulate API call
      setTimeout(() => {
        console.log('Vendor Registration:', this.vendorForm.value);
        this.isSubmitting = false;
        this.isSubmitted = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.vendorForm.controls).forEach(key => {
        this.vendorForm.get(key)?.markAsTouched();
      });
    }
  }

  scrollToForm(): void {
    const formSection = document.getElementById('vendor-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
