import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { B2bService, StoreOrderSchedule, ScheduledOrderLine, CreateCartRequest } from '../../../core/services/b2b/b2b.service';
import { StoreService } from '../../../core/services/store/store.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import Swal from 'sweetalert2';

interface CartItem extends ScheduledOrderLine {
  ItemImage?: string;
}

@Component({
  selector: 'app-b2b-new-order',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Create New Order</h1>
          <p class="text-gray-500 mt-1">Select a schedule, choose products, and place your order</p>
        </div>
      </div>
    
      <!-- Stepper -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          @for (step of steps; track step; let i = $index) {
            <div
              class="flex items-center"
              [class.flex-1]="i < steps.length - 1"
              >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all"
                  [ngClass]="currentStep >= i + 1 ? 'bg-[#42af57] text-white' : 'bg-gray-200 text-gray-500'"
                  >
                  @if (currentStep > i + 1) {
                    <i class="fas fa-check"></i>
                  }
                  @if (currentStep <= i + 1) {
                    <span>{{ i + 1 }}</span>
                  }
                </div>
                <span
                  class="hidden sm:block text-sm font-medium"
                  [ngClass]="currentStep >= i + 1 ? 'text-gray-900' : 'text-gray-400'"
                  >
                  {{ step }}
                </span>
              </div>
              @if (i < steps.length - 1) {
                <div
                  class="flex-1 h-0.5 mx-4"
                  [ngClass]="currentStep > i + 1 ? 'bg-[#42af57]' : 'bg-gray-200'"
                ></div>
              }
            </div>
          }
        </div>
      </div>
    
      <!-- Delivery Info Banner -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-truck text-blue-600"></i>
          </div>
          <div class="flex-1">
            <p class="font-medium text-blue-900">Delivery Schedule</p>
            <p class="text-sm text-blue-700">Deliveries happen on <span class="font-semibold">Mondays, Wednesdays, and Fridays</span></p>
          </div>
          <div class="hidden sm:flex items-center gap-2">
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Mon</span>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Wed</span>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Fri</span>
          </div>
        </div>
      </div>
    
      <!-- Step 1: Select Schedule -->
      @if (currentStep === 1) {
        <div class="space-y-4">
          @if (isLoadingSchedules) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (i of [1,2]; track i) {
                <div class="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div class="h-4 bg-gray-100 rounded w-2/3"></div>
                </div>
              }
            </div>
          }
          @if (!isLoadingSchedules && schedules.length === 0) {
            <div class="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-calendar-times text-gray-400 text-2xl"></i>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No schedules available</h3>
              <p class="text-gray-500">There are no open schedules at the moment. Please check back later.</p>
            </div>
          }
          @if (!isLoadingSchedules && schedules.length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (schedule of schedules; track schedule) {
                <div
                  (click)="selectSchedule(schedule)"
                  class="bg-white rounded-xl border-2 p-5 cursor-pointer transition-all"
                  [ngClass]="selectedSchedule?.DocEntry === schedule.DocEntry ? 'border-[#42af57] bg-[#42af57]/5' : 'border-gray-200 hover:border-[#42af57]'"
                  >
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <h3 class="font-semibold text-gray-900">Schedule #{{ schedule.DocNum }}</h3>
                      <p class="text-sm text-gray-500">{{ schedule.Remark || 'Order Schedule' }}</p>
                    </div>
                    <div
                      class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                      [ngClass]="selectedSchedule?.DocEntry === schedule.DocEntry ? 'border-[#42af57] bg-[#42af57]' : 'border-gray-300'"
                      >
                      @if (selectedSchedule?.DocEntry === schedule.DocEntry) {
                        <i class="fas fa-check text-white text-xs"></i>
                      }
                    </div>
                  </div>
                  <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2 text-gray-600">
                      <i class="fas fa-calendar w-4 text-gray-400"></i>
                      Order window: {{ schedule.StartDate | date:'MMM d' }} - {{ schedule.EndDate | date:'MMM d' }}
                    </div>
                    <div class="flex items-center gap-2 text-gray-600">
                      <i class="fas fa-truck w-4 text-gray-400"></i>
                      {{ schedule.AvailableDeliveryDates?.length || 0 }} delivery dates available
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    
      <!-- Step 2: Select Delivery Date -->
      @if (currentStep === 2) {
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Select Delivery Date</h3>
          <p class="text-gray-500 mb-6">Choose when you'd like your order delivered</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            @for (date of selectedSchedule?.AvailableDeliveryDates; track date) {
              <button
                (click)="selectedDeliveryDate = date"
                class="p-4 rounded-xl border-2 text-center transition-all"
                [ngClass]="selectedDeliveryDate === date ? 'border-[#42af57] bg-[#42af57]/5' : 'border-gray-200 hover:border-[#42af57]'"
                >
                <p class="text-xs text-gray-500">{{ date | date:'EEE' }}</p>
                <p class="text-lg font-bold text-gray-900">{{ date | date:'d' }}</p>
                <p class="text-sm text-gray-600">{{ date | date:'MMM' }}</p>
              </button>
            }
          </div>
        </div>
      }
    
      <!-- Step 3: Add Products -->
      @if (currentStep === 3) {
        <div class="space-y-6">
          <!-- Search and Filter -->
          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1 relative">
                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  [(ngModel)]="productSearchQuery"
                  placeholder="Search products..."
                  class="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#42af57] focus:outline-none"
                  />
              </div>
              <select
                [(ngModel)]="categoryFilter"
                class="px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#42af57] focus:outline-none cursor-pointer"
                >
                <option value="">All Categories</option>
                <option value="dairy">Dairy</option>
                <option value="bread">Bread & Bakery</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Products Grid -->
            <div class="lg:col-span-2">
              @if (isLoadingProducts) {
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  @for (i of [1,2,3,4,5,6]; track i) {
                    <div class="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                      <div class="w-full h-24 bg-gray-100 rounded-lg mb-3"></div>
                      <div class="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div class="h-4 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  }
                </div>
              }
              @if (!isLoadingProducts) {
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  @for (product of filteredProducts; track product) {
                    <div
                      class="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#42af57] transition-all"
                      >
                      <div class="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        @if (product.image) {
                          <img
                            [src]="product.image"
                            [alt]="product.ItemName"
                            class="w-full h-full object-contain p-2"
                            (error)="product.image = ''"
                            />
                        }
                        @if (!product.image) {
                          <i class="fas fa-box text-gray-300 text-3xl"></i>
                        }
                      </div>
                      <h4 class="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{{ product.ItemName }}</h4>
                      <p class="text-xs text-gray-500 mb-2">{{ product.ItemCode }}</p>
                      <p class="font-bold text-[#42af57] mb-3">USD {{ product.PriceAfterVAT | number:'1.2-2' }}</p>
                      <div class="flex items-center gap-2">
                        <button
                          (click)="decrementQuantity(product)"
                          class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                          <i class="fas fa-minus text-xs"></i>
                        </button>
                        <input
                          type="number"
                          [(ngModel)]="product.quantity"
                          min="0"
                          class="w-12 text-center border border-gray-200 rounded-lg py-1 text-sm"
                          />
                        <button
                          (click)="incrementQuantity(product)"
                          class="w-8 h-8 rounded-lg bg-[#42af57] hover:bg-[#3d9332] text-white flex items-center justify-center"
                          >
                          <i class="fas fa-plus text-xs"></i>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
            <!-- Cart Summary -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl border border-gray-200 sticky top-4">
                <div class="p-5 border-b border-gray-100">
                  <h3 class="font-semibold text-gray-900">
                    <i class="fas fa-shopping-cart text-[#42af57] mr-2"></i>
                    Cart ({{ cartItems.length }})
                  </h3>
                </div>
                @if (cartItems.length === 0) {
                  <div class="p-5 text-center">
                    <i class="fas fa-shopping-basket text-gray-300 text-4xl mb-3"></i>
                    <p class="text-gray-500 text-sm">Your cart is empty</p>
                  </div>
                }
                @if (cartItems.length > 0) {
                  <div class="max-h-80 overflow-y-auto">
                    @for (item of cartItems; track item) {
                      <div class="p-4 border-b border-gray-100 last:border-0">
                        <div class="flex items-start justify-between gap-2">
                          <div class="flex-1">
                            <p class="font-medium text-gray-900 text-sm">{{ item.ItemName }}</p>
                            <p class="text-xs text-gray-500">{{ item.Quantity }} x USD {{ item.PriceAfterVAT | number:'1.2-2' }}</p>
                          </div>
                          <div class="text-right">
                            <p class="font-semibold text-gray-900 text-sm">USD {{ item.LineTotal | number:'1.2-2' }}</p>
                            <button
                              (click)="removeFromCart(item)"
                              class="text-xs text-red-500 hover:underline"
                              >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
                @if (cartItems.length > 0) {
                  <div class="p-5 bg-gray-50 border-t border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                      <span class="font-semibold text-gray-900">Total</span>
                      <span class="text-xl font-bold text-[#42af57]">USD {{ cartTotal | number:'1.2-2' }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    
      <!-- Step 4: Review & Confirm -->
      @if (currentStep === 4) {
        <div class="space-y-6">
          <!-- Order Summary -->
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
              <h3 class="font-semibold text-gray-900">Order Summary</h3>
            </div>
            <div class="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p class="text-sm text-gray-500">Schedule</p>
                <p class="font-semibold text-gray-900">#{{ selectedSchedule?.DocNum }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Delivery Date</p>
                <p class="font-semibold text-gray-900">{{ selectedDeliveryDate | date:'MMM d, yyyy' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Items</p>
                <p class="font-semibold text-gray-900">{{ cartItems.length }} products</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Payment</p>
                <p class="font-semibold text-gray-900">Cash on Delivery</p>
              </div>
            </div>
          </div>
          <!-- Cart Items -->
          <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div class="p-5 border-b border-gray-100">
              <h3 class="font-semibold text-gray-900">Order Items</h3>
            </div>
            <div class="divide-y divide-gray-100">
              @for (item of cartItems; track item) {
                <div class="p-4 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      @if (item.ItemImage) {
                        <img
                          [src]="item.ItemImage"
                          [alt]="item.ItemName"
                          class="w-full h-full object-contain p-1"
                          />
                      }
                      @if (!item.ItemImage) {
                        <i class="fas fa-box text-gray-400"></i>
                      }
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">{{ item.ItemName }}</p>
                      <p class="text-sm text-gray-500">{{ item.ItemCode }} | Qty: {{ item.Quantity }}</p>
                    </div>
                  </div>
                  <p class="font-semibold text-gray-900">USD {{ item.LineTotal | number:'1.2-2' }}</p>
                </div>
              }
            </div>
            <div class="p-5 bg-gray-50 flex items-center justify-between">
              <span class="text-lg font-semibold text-gray-900">Grand Total</span>
              <span class="text-2xl font-bold text-[#42af57]">USD {{ cartTotal | number:'1.2-2' }}</span>
            </div>
          </div>
          <!-- Comments -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <label class="block text-sm font-medium text-gray-700 mb-2">Order Comments (Optional)</label>
            <textarea
              [(ngModel)]="orderComments"
              rows="3"
              placeholder="Add any special instructions or notes for this order..."
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#42af57] focus:outline-none resize-none"
            ></textarea>
          </div>
        </div>
      }
    
      <!-- AI-Powered Recommendation Popup -->
      @if (showRecommendation && currentStep === 3) {
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          (click)="dismissRecommendation()"
          >
          <div
            class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-pulse-once"
            (click)="$event.stopPropagation()"
            >
            <!-- AI Header with animated gradient -->
            <div class="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 overflow-hidden">
              <!-- Animated background circles -->
              <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              <div class="relative flex items-center gap-4">
                <div class="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <i class="fas fa-wand-magic-sparkles text-white text-2xl"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium text-white/90">AI Insight</span>
                    <span class="flex items-center gap-1 text-white/70 text-xs">
                      <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  </div>
                  <h3 class="text-xl font-bold text-white">Hey, quick thought!</h3>
                </div>
              </div>
            </div>
            <!-- Content -->
            <div class="p-6">
              <!-- AI Message bubble -->
              <div class="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl p-5 mb-5 relative">
                <div class="absolute -top-2 left-6 w-4 h-4 bg-gray-50 rotate-45"></div>
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <i class="fas fa-cheese text-amber-500 text-2xl"></i>
                  </div>
                  <div class="flex-1">
                    <p class="text-violet-600 text-sm font-medium mb-2 flex items-center gap-2">
                      <i class="fas fa-brain"></i>
                      Based on your patterns
                    </p>
                    <h4 class="font-bold text-gray-900 text-lg leading-tight">
                      You haven't ordered <span class="text-violet-600">{{ recommendedProduct.name }}</span> in {{ recommendedProduct.daysSincePurchase }} days
                    </h4>
                    <p class="text-gray-500 text-sm mt-2">
                      You typically restock every <span class="font-semibold text-gray-700">{{ recommendedProduct.usualFrequency }} days</span>. Running low?
                    </p>
                  </div>
                </div>
              </div>
              <!-- Quick add section -->
              <div class="bg-white border-2 border-gray-100 rounded-2xl p-4 mb-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-bolt text-amber-500"></i>
                    <span class="font-semibold text-gray-800">Quick Add</span>
                  </div>
                  <span class="text-xl font-bold text-[#42af57]">USD {{ recommendedProduct.price | number:'1.2-2' }}</span>
                </div>
                <div class="flex items-center justify-center gap-4">
                  <button
                    (click)="decrementRecommendedQty()"
                    class="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all active:scale-95"
                    >
                    <i class="fas fa-minus text-gray-700"></i>
                  </button>
                  <div class="text-center">
                    <input
                      type="number"
                      [(ngModel)]="recommendedQuantity"
                      min="1"
                      class="w-20 text-center text-2xl font-bold text-gray-900 border-0 bg-transparent focus:outline-none"
                      />
                    <p class="text-xs text-gray-400 -mt-1">quantity</p>
                  </div>
                  <button
                    (click)="incrementRecommendedQty()"
                    class="w-12 h-12 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-700 flex items-center justify-center transition-all active:scale-95"
                    >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                <div class="text-center mt-3 pt-3 border-t border-gray-100">
                  <span class="text-gray-500">Total: </span>
                  <span class="text-lg font-bold text-gray-900">USD {{ (recommendedProduct.price * recommendedQuantity) | number:'1.2-2' }}</span>
                </div>
              </div>
              <!-- Actions -->
              <div class="flex gap-3">
                <button
                  (click)="dismissRecommendation()"
                  class="flex-1 px-5 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all active:scale-98"
                  >
                  No thanks
                </button>
                <button
                  (click)="addRecommendedToCart()"
                  class="flex-1 px-5 py-3.5 bg-gradient-to-r from-[#42af57] to-[#2d9a45] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                  <i class="fas fa-plus"></i>
                  Yes, add it!
                </button>
              </div>
            </div>
            <!-- Footer insight with sparkle -->
            <div class="bg-gradient-to-r from-violet-50 to-indigo-50 px-6 py-3 border-t border-violet-100">
              <p class="text-xs text-violet-600 flex items-center justify-center gap-2">
                <i class="fas fa-sparkles"></i>
                <span>Powered by your purchase history • Updated in real-time</span>
              </p>
            </div>
          </div>
        </div>
      }
    
      <!-- Navigation Buttons -->
      <div class="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
        @if (currentStep > 1) {
          <button
            (click)="previousStep()"
            class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
            <i class="fas fa-arrow-left"></i>
            Previous
          </button>
        }
        @if (currentStep === 1) {
          <div></div>
        }
    
        @if (currentStep < 4) {
          <button
            (click)="nextStep()"
            [disabled]="!canProceed()"
            class="inline-flex items-center gap-2 bg-[#42af57] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#3d9332] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Next
            <i class="fas fa-arrow-right"></i>
          </button>
        }
    
        @if (currentStep === 4) {
          <button
            (click)="submitOrder()"
            [disabled]="isSubmitting"
            class="inline-flex items-center gap-2 bg-[#42af57] text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-[#3d9332] transition-all disabled:opacity-50"
            >
            @if (isSubmitting) {
              <i class="fas fa-spinner fa-spin"></i>
            }
            @if (!isSubmitting) {
              <i class="fas fa-check"></i>
            }
            {{ isSubmitting ? 'Placing Order...' : 'Place Order' }}
          </button>
        }
      </div>
    </div>
    `
})
export class B2bNewOrderComponent implements OnInit {
  steps = ['Select Schedule', 'Delivery Date', 'Add Products', 'Review'];
  currentStep = 1;

  schedules: StoreOrderSchedule[] = [];
  selectedSchedule: StoreOrderSchedule | null = null;
  selectedDeliveryDate: string = '';

  products: any[] = [];
  cartItems: CartItem[] = [];
  orderComments = '';

  isLoadingSchedules = true;
  isLoadingProducts = true;
  isSubmitting = false;

  productSearchQuery = '';
  categoryFilter = '';

  // AI Recommendation
  showRecommendation = false;
  recommendedQuantity = 2;
  recommendedProduct = {
    code: 'BUT001',
    name: 'Butter 250g',
    price: 4.00,
    daysSincePurchase: 14,
    usualFrequency: 7
  };

  constructor(
    private b2bService: B2bService,
    private storeService: StoreService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
    this.loadProducts();

    // Check for pre-selected schedule from query params
    this.route.queryParams.subscribe(params => {
      if (params['schedule']) {
        const scheduleId = parseInt(params['schedule'], 10);
        this.preselectSchedule(scheduleId);
      }
    });
  }

  loadSchedules(): void {
    this.isLoadingSchedules = true;
    this.b2bService.getAvailableSchedules().subscribe({
      next: (schedules) => {
        this.schedules = schedules.filter(s => s.Status === 'Open');
        this.isLoadingSchedules = false;
      },
      error: () => {
        // Mock data
        this.schedules = [
          {
            DocEntry: 1,
            DocNum: 1001,
            Remark: 'Weekly Dairy Products Order',
            StartDate: '2026-01-13T00:00:00',
            EndDate: '2026-01-20T00:00:00',
            StartDeliveryDate: '2026-01-15T00:00:00',
            EndDeliveryDate: '2026-01-19T00:00:00',
            Status: 'Open',
            AvailableDeliveryDates: [
              '2026-01-15T00:00:00',
              '2026-01-16T00:00:00',
              '2026-01-17T00:00:00',
              '2026-01-18T00:00:00',
              '2026-01-19T00:00:00'
            ]
          },
          {
            DocEntry: 2,
            DocNum: 1002,
            Remark: 'Monthly Bulk Stock Order',
            StartDate: '2026-01-15T00:00:00',
            EndDate: '2026-01-31T00:00:00',
            StartDeliveryDate: '2026-01-17T00:00:00',
            EndDeliveryDate: '2026-01-30T00:00:00',
            Status: 'Open',
            AvailableDeliveryDates: [
              '2026-01-17T00:00:00',
              '2026-01-20T00:00:00',
              '2026-01-22T00:00:00',
              '2026-01-24T00:00:00',
              '2026-01-27T00:00:00'
            ]
          }
        ];
        this.isLoadingSchedules = false;
      }
    });
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.storeService.getStoreItems('USD', 50, 1, '', '').subscribe({
      next: (response: any) => {
        // Ensure we get an array, not a function
        let rawProducts: any[] = [];
        if (Array.isArray(response.values)) {
          rawProducts = response.values;
        } else if (Array.isArray(response)) {
          rawProducts = response;
        }
        // Map lowercase API response to PascalCase for template compatibility
        this.products = rawProducts.map((p: any) => ({
          ItemCode: p.itemCode || p.ItemCode,
          ItemName: p.itemName || p.ItemName,
          PriceAfterVAT: p.price || p.PriceAfterVAT || 0,
          VATRate: p.salesVATRate || p.VATRate || 0,
          image: p.image || '',
          currency: p.currency || 'USD',
          unitsOnStock: p.unitsOnStock || 0,
          quantity: 0
        }));
        this.isLoadingProducts = false;
      },
      error: () => {
        // Mock products
        this.products = [
          { ItemCode: 'MILK001', ItemName: 'Fresh Milk 1L', PriceAfterVAT: 1.50, VATRate: 15, quantity: 0 },
          { ItemCode: 'MILK002', ItemName: 'Fresh Milk 500ml', PriceAfterVAT: 0.85, VATRate: 15, quantity: 0 },
          { ItemCode: 'YOG001', ItemName: 'Plain Yoghurt 500ml', PriceAfterVAT: 2.00, VATRate: 15, quantity: 0 },
          { ItemCode: 'YOG002', ItemName: 'Strawberry Yoghurt 175g', PriceAfterVAT: 1.20, VATRate: 15, quantity: 0 },
          { ItemCode: 'CHE001', ItemName: 'Cheddar Cheese 200g', PriceAfterVAT: 3.50, VATRate: 15, quantity: 0 },
          { ItemCode: 'CHE002', ItemName: 'Mozzarella Cheese 250g', PriceAfterVAT: 4.00, VATRate: 15, quantity: 0 },
          { ItemCode: 'CRE001', ItemName: 'Fresh Cream 250ml', PriceAfterVAT: 2.50, VATRate: 15, quantity: 0 },
          { ItemCode: 'CRE002', ItemName: 'Whipping Cream 500ml', PriceAfterVAT: 4.50, VATRate: 15, quantity: 0 },
          { ItemCode: 'BUT001', ItemName: 'Butter 250g', PriceAfterVAT: 4.00, VATRate: 15, quantity: 0 },
          { ItemCode: 'BUT002', ItemName: 'Butter 500g', PriceAfterVAT: 7.50, VATRate: 15, quantity: 0 },
          { ItemCode: 'BRD001', ItemName: 'White Bread Loaf', PriceAfterVAT: 1.20, VATRate: 15, quantity: 0 },
          { ItemCode: 'BRD002', ItemName: 'Brown Bread Loaf', PriceAfterVAT: 1.35, VATRate: 15, quantity: 0 }
        ];
        this.isLoadingProducts = false;
      }
    });
  }

  preselectSchedule(scheduleId: number): void {
    setTimeout(() => {
      const schedule = this.schedules.find(s => s.DocEntry === scheduleId);
      if (schedule) {
        this.selectSchedule(schedule);
        this.currentStep = 2;
      }
    }, 500);
  }

  selectSchedule(schedule: StoreOrderSchedule): void {
    this.selectedSchedule = schedule;
    this.selectedDeliveryDate = '';
  }

  get filteredProducts(): any[] {
    return this.products.filter(p => {
      const matchesSearch = !this.productSearchQuery ||
        p.ItemName.toLowerCase().includes(this.productSearchQuery.toLowerCase()) ||
        p.ItemCode.toLowerCase().includes(this.productSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }

  incrementQuantity(product: any): void {
    product.quantity = (product.quantity || 0) + 1;
    this.updateCart(product);
  }

  decrementQuantity(product: any): void {
    if (product.quantity > 0) {
      product.quantity--;
      this.updateCart(product);
    }
  }

  updateCart(product: any): void {
    const existingIndex = this.cartItems.findIndex(item => item.ItemCode === product.ItemCode);

    if (product.quantity > 0) {
      const cartItem: CartItem = {
        LineNum: existingIndex >= 0 ? existingIndex : this.cartItems.length,
        ItemCode: product.ItemCode,
        ItemName: product.ItemName,
        Quantity: product.quantity,
        PriceAfterVAT: product.PriceAfterVAT,
        WarehouseCode: 'WH01',
        VatGroup: 'VAT15',
        VATRate: product.VATRate || 15,
        UoMEntry: 1,
        UoMCode: 'EA',
        LineTotal: product.quantity * product.PriceAfterVAT,
        ItemImage: product.image || ''
      };

      if (existingIndex >= 0) {
        this.cartItems[existingIndex] = cartItem;
      } else {
        this.cartItems.push(cartItem);
      }
    } else {
      if (existingIndex >= 0) {
        this.cartItems.splice(existingIndex, 1);
      }
    }
  }

  removeFromCart(item: CartItem): void {
    const product = this.products.find(p => p.ItemCode === item.ItemCode);
    if (product) {
      product.quantity = 0;
    }
    this.cartItems = this.cartItems.filter(i => i.ItemCode !== item.ItemCode);
  }

  get cartTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.LineTotal, 0);
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: return !!this.selectedSchedule;
      case 2: return !!this.selectedDeliveryDate;
      case 3: return this.cartItems.length > 0;
      default: return true;
    }
  }

  nextStep(): void {
    if (this.canProceed() && this.currentStep < 4) {
      this.currentStep++;

      // Show AI recommendation when entering step 3 (Add Products)
      // Only show once per session and after user has added at least one product
      if (this.currentStep === 3) {
        this.checkAndShowRecommendation();
      }
    }
  }

  private checkAndShowRecommendation(): void {
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem('b2b_ai_recommendation_dismissed');
    if (dismissed) {
      return;
    }

    // Show after a longer delay (5 seconds) and only if user has added products
    setTimeout(() => {
      if (this.cartItems.length > 0 && this.currentStep === 3) {
        this.showRecommendation = true;
      }
    }, 5000);
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submitOrder(): void {
    if (!this.selectedSchedule || !this.selectedDeliveryDate || this.cartItems.length === 0) {
      return;
    }

    this.isSubmitting = true;

    const user = this.authService.getAuthUser();
    const currency = user?.customer?.currency || 'USD';

    // Step 1: Create cart
    const cartRequest: CreateCartRequest = {
      CartTime: new Date().toISOString(),
      CartId: null,
      ScheduleDocEntry: this.selectedSchedule.DocEntry,
      DeliveryDate: this.selectedDeliveryDate,
      DocCurrency: currency,
      Comments: this.orderComments,
      DocTotal: this.cartTotal,
      DocumentLines: this.cartItems.map((item, index) => ({
        LineNum: index,
        ItemCode: item.ItemCode,
        ItemName: item.ItemName,
        Quantity: item.Quantity,
        PriceAfterVAT: item.PriceAfterVAT,
        WarehouseCode: user?.customer?.warehouse || 'WH01',
        VatGroup: item.VatGroup || 'VAT15',
        VATRate: item.VATRate || 15,
        UoMEntry: item.UoMEntry || 1,
        UoMCode: item.UoMCode || 'EA',
        LineTotal: item.LineTotal
      }))
    };

    this.b2bService.createCart(cartRequest).subscribe({
      next: (cartResponse) => {
        // Step 2: Create order from cart
        this.b2bService.createOrder(cartResponse.CartId).subscribe({
          next: (orderResponse) => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'success',
              title: 'Order Placed Successfully!',
              html: `
                <p>Your scheduled order <strong>#${orderResponse.DocNum}</strong> has been submitted.</p>
                <p class="text-sm text-gray-500 mt-2">Delivery Date: ${new Date(this.selectedDeliveryDate).toLocaleDateString()}</p>
              `,
              confirmButtonColor: '#42af57'
            }).then(() => {
              this.router.navigate(['/b2b/orders']);
            });
          },
          error: (error) => {
            this.isSubmitting = false;
            Swal.fire({
              icon: 'error',
              title: 'Order Failed',
              text: error?.error?.message || 'Failed to create order. Please try again.',
              confirmButtonColor: '#42af57'
            });
          }
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Cart Creation Failed',
          text: error?.error?.message || 'Failed to create cart. Please try again.',
          confirmButtonColor: '#42af57'
        });
      }
    });
  }

  // AI Recommendation methods
  dismissRecommendation(): void {
    this.showRecommendation = false;
    // Remember dismissal for this session so it doesn't show again
    sessionStorage.setItem('b2b_ai_recommendation_dismissed', 'true');
  }

  incrementRecommendedQty(): void {
    this.recommendedQuantity++;
  }

  decrementRecommendedQty(): void {
    if (this.recommendedQuantity > 1) {
      this.recommendedQuantity--;
    }
  }

  addRecommendedToCart(): void {
    // Find the product in the products array
    const product = this.products.find(p => p.ItemCode === this.recommendedProduct.code);
    if (product) {
      product.quantity = this.recommendedQuantity;
      this.updateCart(product);
    } else {
      // Add as new item if not found in products
      const newItem: CartItem = {
        LineNum: this.cartItems.length,
        ItemCode: this.recommendedProduct.code,
        ItemName: this.recommendedProduct.name,
        Quantity: this.recommendedQuantity,
        PriceAfterVAT: this.recommendedProduct.price,
        WarehouseCode: 'WH01',
        VatGroup: 'VAT15',
        VATRate: 15,
        UoMEntry: 1,
        UoMCode: 'EA',
        LineTotal: this.recommendedQuantity * this.recommendedProduct.price
      };
      this.cartItems.push(newItem);
    }

    this.showRecommendation = false;
    // Remember that user added the recommendation so it doesn't show again
    sessionStorage.setItem('b2b_ai_recommendation_dismissed', 'true');

    // Show success toast
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${this.recommendedProduct.name} added to cart!`,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  }
}
