import {Injectable, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {MetaPixelService} from "../meta-pixel/meta-pixel.service";
import {GoogleAnalyticsService} from "../google-analytics/google-analytics.service";
import {ToastService} from "../toast/toast.service";

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnInit {

  private cart = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cart.asObservable();
  apiUrl = environment.apiURL;

  constructor(
    private http: HttpClient,
    private metaPixelService: MetaPixelService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private toastService: ToastService
  ) {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this.cart.next(JSON.parse(storedCart));
    }
  }

  ngOnInit() {
    this.calculateCartTotal();
  }

  getCartItems() {
    return this.cart.value;
  }

  addToCart(item: any, uom:any) {
    ///If item exists it should increment item
    const existingItem = this.cart.value.find((i) => (i.itemName === item.itemName) && (i.uom.uomEntry === uom.uomEntry));
    if (existingItem) {
      existingItem.quantity++;
      const updatedCart = this.cart.value.filter((i) => i.itemName !== item.itemName);
      updatedCart.push(existingItem);
      this.cart.next(updatedCart);
      this.calculateCartTotal()
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      // Track add to cart event
      this.googleAnalyticsService.trackEcommerceEvent('add_to_cart', [{
        item_id: item.itemCode,
        item_name: item.itemName,
        quantity: 1,
        price: uom.price,
        currency: uom.currency
      }], uom.price, uom.currency);

      this.toastService.success('Added to Cart', `${item.itemName} quantity updated`);

      return;
    }

    ///If new item add a new item
    let newItem = item;
    newItem.quantity = 1;
    newItem.uom = uom;
    const updatedCart = [...this.cart.value, newItem];
    this.cart.next(updatedCart);
    this.calculateCartTotal()
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Track add to cart event
    this.googleAnalyticsService.trackEcommerceEvent('add_to_cart', [{
      item_id: item.itemCode,
      item_name: item.itemName,
      quantity: 1,
      price: uom.price,
      currency: uom.currency
    }], uom.price, uom.currency);

    this.toastService.success('Added to Cart', item.itemName);
  }

  incrementItem(item: any, uom: any) {
    const cartItems = [...this.cart.value];
    const index = cartItems.findIndex(
      (i) => i.itemName === item.itemName && i.uom.uomEntry === uom.uomEntry
    );

    if (index !== -1) {
      cartItems[index].quantity++;
      this.cart.next(cartItems);
      this.calculateCartTotal();
      localStorage.setItem('cart', JSON.stringify(cartItems));

      // Track add to cart event for increment
      this.googleAnalyticsService.trackEcommerceEvent('add_to_cart', [{
        item_id: item.itemCode,
        item_name: item.itemName,
        quantity: 1,
        price: uom.price,
        currency: uom.currency
      }], uom.price, uom.currency);

      this.toastService.success('Quantity Updated', `${item.itemName} (${cartItems[index].quantity})`);
      return;
    }

    // If item does not exist, add as new
    const newItem = { ...item, quantity: 1, uom };
    const updatedCart = [...cartItems, newItem];
    this.cart.next(updatedCart);
    this.calculateCartTotal();
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Track add to cart event for new item
    this.googleAnalyticsService.trackEcommerceEvent('add_to_cart', [{
      item_id: item.itemCode,
      item_name: item.itemName,
      quantity: 1,
      price: uom.price,
      currency: uom.currency
    }], uom.price, uom.currency);

    this.toastService.success('Added to Cart', item.itemName);
  }


  removeFromCart(index: number) {
    ///remove should first reduce quantity and then remove item
    const item = this.cart.value[index];
    if (item.quantity > 1) {
      item.quantity--;
      const updatedCart = [...this.cart.value];
      updatedCart[index] = item;
      this.cart.next(updatedCart);
      this.calculateCartTotal()
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      // Track remove from cart event
      this.googleAnalyticsService.trackEcommerceEvent('remove_from_cart', [{
        item_id: item.itemCode,
        item_name: item.itemName,
        quantity: 1,
        price: item.uom.price,
        currency: item.uom.currency
      }], item.uom.price, item.uom.currency);

      this.toastService.info('Quantity Updated', `${item.itemName} (${item.quantity})`);
      return;
    }

    const itemName = item.itemName;
    const updatedCart = this.cart.value.filter((_, i) => i !== index);
    this.cart.next(updatedCart);
    this.calculateCartTotal()
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Track remove from cart event
    this.googleAnalyticsService.trackEcommerceEvent('remove_from_cart', [{
      item_id: item.itemCode,
      item_name: item.itemName,
      quantity: item.quantity,
      price: item.uom.price,
      currency: item.uom.currency
    }], item.uom.price * item.quantity, item.uom.currency);

    this.toastService.warning('Removed from Cart', itemName);
  }


  clearCart(showToast = true) {
    this.cart.next([]);
    this.calculateCartTotal()
    localStorage.removeItem('cart');
    if (showToast) {
      this.toastService.info('Cart Cleared', 'All items have been removed');
    }
  }

  getItemCount() {
    return this.cart.value.length;
  }

 //Get cart total
  private cartTotalSubject = new BehaviorSubject<number>(0);
  cartTotal$:any = this.cartTotalSubject.asObservable();


//Get cart total
getCartTotal(): Observable<number> {
  this.calculateCartTotal();
  return this.cartTotalSubject.asObservable();
}

private calculateCartTotal() {
  let total = 0;
  this.cart.value.forEach((item) => {
    total += item.uom.price * item.quantity;
  });
  this.cartTotalSubject.next(total);

  return total;
}

calcTotal(){
 this.calculateCartTotal()
}

beginCheckout() {
  const cartItems = this.cart.value;
  const items = cartItems.map(item => ({
    item_id: item.itemCode,
    item_name: item.itemName,
    quantity: item.quantity,
    price: item.uom.price,
    currency: item.uom.currency
  }));
  const total = this.calculateCartTotal();
  const currency = cartItems.length > 0 ? cartItems[0].uom.currency : 'USD';

  this.googleAnalyticsService.trackEcommerceEvent('begin_checkout', items, total, currency);
}


//Order Logic
  createOrderApi(payload:any){
    // let params = {
    //   currency: currency,
    //   pageSize: pageSize,
    //   pageNumber: pageNumber,
    //   filterExtension: filterExtension
    // }
    return this.http.post(`${this.apiUrl}StoreInvoices`,payload).pipe(
      tap(() => {
        // Track purchase after successful order creation
        const total = this.calculateCartTotal();
        const cartItems = this.cart.value;
        const items = cartItems.map(item => ({
          item_id: item.itemCode,
          item_name: item.itemName,
          quantity: item.quantity,
          price: item.uom.price,
          currency: item.uom.currency
        }));
        const currency = cartItems.length > 0 ? cartItems[0].uom.currency : 'USD';

        this.googleAnalyticsService.trackEcommerceEvent('purchase', items, total, currency);
        this.metaPixelService.trackPurchase(total, currency);
      })
    );
  }

  createOrderApiInnBucks(payload:any ) {
    return this.http.post(`${this.apiUrl}StoreInvoices/InnBucks/GetPaymentCode`,payload);
  }

  checkInnBucksTransaction(payload:any ) {
    return this.http.post(`${this.apiUrl}InnBucks/EnquireCode`,payload);
  }

  createOrderPayNow(payload:any ) {
    return this.http.post(`${this.apiUrl}StoreInvoices/PayNow/InitiatePayment`,payload);
  }

  checkOrderFromPayNow(url:any) {
    return this.http.get(`${url}`);
    // return of("reference=2504783610&paynowreference=21920422&amount=15.00&status=Paid&pollurl=https%3a%2f%2fwww.paynow.co.zw%2fInterface%2fCheckPayment%2f%3fguid%3d4dfb62f5-8105-4356-a77e-0068054e2f82&hash=AC92C56DD2089A91003CD0EDCD156DDC780BAA6D1FB56A69BB8079753FF38D1E87C78DE551892AD23E8F4D1DB94DB5E64EC1F2442EDF3028A97B472190B64286");
  }

  previewCart(payload: any) {
    return this.http.post(`${this.apiUrl}StoreInvoices/Carts`,payload);
  }


}
