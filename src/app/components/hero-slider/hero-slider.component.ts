import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Slide {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  bgGradient: string;
}

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './hero-slider.component.html',
  styleUrl: './hero-slider.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  email = '';
  autoPlayInterval: any;
  hasHeroImage = false;
  hasSideImage = false;

  slides: Slide[] = [
    {
      title: 'Snacks box',
      subtitle: 'daily save',
      description: 'Sign up for the daily newsletter',
      buttonText: 'Subscribe',
      buttonLink: '/store',
      imageUrl: 'assets/images/hero/snacks-pack.png',
      bgGradient: 'from-gray-50 to-green-50'
    },
    {
      title: 'Fresh Dairy',
      subtitle: 'delivered fast',
      description: 'Farm fresh products at your door',
      buttonText: 'Shop Now',
      buttonLink: '/store?group=DAIRY',
      imageUrl: 'assets/images/hero/dairy-products.png',
      bgGradient: 'from-blue-50 to-cyan-50'
    }
  ];

  sideCards = [
    {
      title: 'Delivered to',
      highlight: 'your',
      subtitle: 'home',
      buttonText: 'Shop Now',
      buttonLink: '/store',
      imageUrl: 'assets/images/hero/juice-bottle.png',
      bgColor: 'bg-gradient-to-br from-teal-50 to-green-100'
    }
  ];

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  onSubscribe() {
    if (this.email) {
      console.log('Subscribing email:', this.email);
      this.email = '';
    }
  }
}
