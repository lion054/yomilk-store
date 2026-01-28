import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly baseTitle = 'Snappy Fresh';
  private readonly baseUrl = 'https://snappyfresh.net';
  private readonly defaultImage = 'https://snappyfresh.net/assets/logo.png';

  // Default SEO configurations for each route
  private readonly routeSeoConfig: { [key: string]: SeoConfig } = {
    '/': {
      title: 'Snappy Fresh | Fresh Dairy, Milk & Groceries Delivery in Harare, Zimbabwe',
      description: 'Order fresh dairy products, milk, yoghurt, cheese, bread and groceries online in Harare, Zimbabwe. Fast delivery, competitive prices. Shop now at Snappy Fresh!',
      keywords: 'fresh milk Zimbabwe, dairy delivery Harare, online grocery Zimbabwe, yoghurt delivery, cheese products Zimbabwe, bread delivery Harare, Snappy Fresh'
    },
    '/store': {
      title: 'Shop Fresh Dairy & Groceries | Snappy Fresh',
      description: 'Browse our wide selection of fresh dairy products, milk, yoghurt, cheese, bread, and household items. Best prices in Harare with fast delivery to your doorstep.',
      keywords: 'buy dairy online Zimbabwe, fresh milk Harare, yoghurt Zimbabwe, cheese delivery, grocery shopping Harare'
    },
    '/cart': {
      title: 'Shopping Cart | Snappy Fresh',
      description: 'Review your shopping cart and checkout. Fast delivery of fresh dairy and groceries in Harare, Zimbabwe.',
      keywords: 'shopping cart, checkout, Snappy Fresh order'
    },
    '/checkout': {
      title: 'Checkout | Snappy Fresh',
      description: 'Complete your order for fresh dairy and groceries. Multiple payment options available including EcoCash and InnBucks.',
      keywords: 'checkout, payment, EcoCash, InnBucks, order delivery'
    },
    '/login': {
      title: 'Sign In | Snappy Fresh',
      description: 'Sign in to your Snappy Fresh account to access your orders, wishlist, and enjoy faster checkout.',
      keywords: 'login, sign in, Snappy Fresh account'
    },
    '/register': {
      title: 'Create Account | Snappy Fresh',
      description: 'Create your Snappy Fresh account and start ordering fresh dairy and groceries online. Enjoy exclusive offers and fast delivery.',
      keywords: 'register, create account, sign up, Snappy Fresh'
    },
    '/profile': {
      title: 'My Account | Snappy Fresh',
      description: 'Manage your Snappy Fresh account, view order history, update profile settings and delivery addresses.',
      keywords: 'my account, profile, order history, account settings'
    },
    '/wishlist': {
      title: 'My Wishlist | Snappy Fresh',
      description: 'View and manage your saved items. Add products to cart from your wishlist for quick shopping.',
      keywords: 'wishlist, saved items, favorite products'
    },
    '/contact-us': {
      title: 'Contact Us | Snappy Fresh',
      description: 'Get in touch with Snappy Fresh. We\'re here to help with your orders, deliveries, and any questions. Call +263 782 978 460 or email support@snappyfresh.net',
      keywords: 'contact Snappy Fresh, customer support, help, phone number, email'
    },
    '/about': {
      title: 'About Us | Snappy Fresh',
      description: 'Learn about Snappy Fresh - Zimbabwe\'s trusted online grocery store. We deliver fresh dairy, milk, yoghurt, and groceries right to your doorstep in Harare.',
      keywords: 'about Snappy Fresh, company, Zimbabwe grocery, online store Harare'
    },
    '/faq': {
      title: 'FAQs | Snappy Fresh',
      description: 'Find answers to frequently asked questions about ordering, delivery, payment methods, and more at Snappy Fresh.',
      keywords: 'FAQ, frequently asked questions, help, delivery questions, payment'
    },
    '/services': {
      title: 'Other Services - Airtime, ZESA, Bills | Snappy Fresh',
      description: 'Buy airtime, ZESA tokens, pay bills and more with Snappy Fresh. Convenient one-stop shop for all your needs in Zimbabwe.',
      keywords: 'airtime Zimbabwe, ZESA tokens, bill payments, DStv, data bundles, Snappy Fresh services'
    },
    '/check-order': {
      title: 'Track Your Order | Snappy Fresh',
      description: 'Track your Snappy Fresh order status. Enter your order number to see real-time delivery updates.',
      keywords: 'track order, order status, delivery tracking, Snappy Fresh'
    },
    '/delivery': {
      title: 'Delivery Information | Snappy Fresh',
      description: 'Learn about Snappy Fresh delivery areas, times, and fees in Harare, Zimbabwe. We deliver fresh dairy and groceries to your door.',
      keywords: 'delivery Harare, delivery areas, delivery times, shipping information'
    },
    '/privacy': {
      title: 'Privacy Policy | Snappy Fresh',
      description: 'Read Snappy Fresh\'s privacy policy. Learn how we protect your personal information and data.',
      keywords: 'privacy policy, data protection, personal information'
    },
    '/terms': {
      title: 'Terms & Conditions | Snappy Fresh',
      description: 'Read Snappy Fresh\'s terms and conditions for using our online grocery delivery service.',
      keywords: 'terms and conditions, terms of service, user agreement'
    },
    '/vendors': {
      title: 'Our Vendors | Snappy Fresh',
      description: 'Discover quality products from our trusted local vendors. Shop from the best suppliers in Zimbabwe at Snappy Fresh.',
      keywords: 'vendors Zimbabwe, suppliers Harare, local vendors, grocery suppliers, Snappy Fresh vendors'
    },
    '/become-a-vendor': {
      title: 'Become a Vendor | Sell on Snappy Fresh',
      description: 'Join Zimbabwe\'s fastest-growing online grocery marketplace. Reach thousands of customers, grow your business, and sell your products on Snappy Fresh.',
      keywords: 'become vendor Zimbabwe, sell online Zimbabwe, vendor registration, marketplace seller, Snappy Fresh vendor'
    }
  };

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.initAutoUpdate();
  }

  /**
   * Automatically update SEO tags based on route changes
   */
  private initAutoUpdate(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      mergeMap(route => route.data)
    ).subscribe(data => {
      const url = this.router.url.split('?')[0];
      const config = this.routeSeoConfig[url];

      if (config) {
        this.updateSeo(config);
      } else {
        // Default SEO for unknown routes
        this.updateSeo({
          title: `${this.baseTitle} | Fresh Dairy & Groceries Delivery`,
          description: 'Order fresh dairy products, milk, yoghurt, cheese, bread and groceries online in Harare, Zimbabwe.'
        });
      }
    });
  }

  /**
   * Update all SEO meta tags
   */
  updateSeo(config: SeoConfig): void {
    // Update title
    this.titleService.setTitle(config.title);

    // Update meta description
    this.metaService.updateTag({ name: 'description', content: config.description });

    // Update keywords if provided
    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Update Open Graph tags
    this.metaService.updateTag({ property: 'og:title', content: config.ogTitle || config.title });
    this.metaService.updateTag({ property: 'og:description', content: config.ogDescription || config.description });
    this.metaService.updateTag({ property: 'og:url', content: config.ogUrl || `${this.baseUrl}${this.router.url}` });
    this.metaService.updateTag({ property: 'og:image', content: config.ogImage || this.defaultImage });

    // Update Twitter tags
    this.metaService.updateTag({ name: 'twitter:title', content: config.ogTitle || config.title });
    this.metaService.updateTag({ name: 'twitter:description', content: config.ogDescription || config.description });
    this.metaService.updateTag({ name: 'twitter:image', content: config.ogImage || this.defaultImage });

    // Update canonical URL
    this.updateCanonicalUrl(config.canonical || `${this.baseUrl}${this.router.url.split('?')[0]}`);
  }

  /**
   * Update page title only
   */
  setTitle(title: string): void {
    this.titleService.setTitle(title);
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
  }

  /**
   * Update meta description only
   */
  setDescription(description: string): void {
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
  }

  /**
   * Set product-specific SEO (for product detail pages)
   */
  setProductSeo(product: any): void {
    const title = `${product.itemName} | Buy Online at Snappy Fresh`;
    const description = product.u_ONA_Description
      ? `${product.u_ONA_Description.substring(0, 150)}... Buy ${product.itemName} online at Snappy Fresh. Fast delivery in Harare.`
      : `Buy ${product.itemName} online at Snappy Fresh. Fresh dairy and groceries delivered to your door in Harare, Zimbabwe.`;

    this.updateSeo({
      title,
      description,
      keywords: `${product.itemName}, buy ${product.itemName} Zimbabwe, ${product.itemsGroupCode || 'dairy'} products`,
      ogImage: product.image || this.defaultImage,
      canonical: `${this.baseUrl}/product/${product.itemCode}`
    });
  }

  /**
   * Set category-specific SEO (for store page with category filter)
   */
  setCategorySeo(categoryName: string): void {
    const title = `${categoryName} Products | Snappy Fresh`;
    const description = `Shop ${categoryName.toLowerCase()} products online at Snappy Fresh. Best prices, fresh quality, fast delivery in Harare, Zimbabwe.`;

    this.updateSeo({
      title,
      description,
      keywords: `${categoryName} Zimbabwe, buy ${categoryName.toLowerCase()} online, ${categoryName.toLowerCase()} delivery Harare`
    });
  }

  /**
   * Update canonical URL
   */
  private updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
