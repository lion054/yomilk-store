import {Component, OnInit} from '@angular/core';
import { CurrencyPipe, DatePipe } from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {CartService} from "../../core/services/cart/cart.service";
import {interval, switchMap, take, takeWhile} from "rxjs";
import Swal from "sweetalert2";
import {StoreService} from "../../core/services/store/store.service";

@Component({
  selector: 'app-check-order',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe
],
  templateUrl: './check-order.component.html',
  styleUrl: './check-order.component.css'
})
export class CheckOrderComponent implements OnInit {

    paymentRef: any
    activeOrder:any
    loading:boolean=true;
    success: boolean = false;
    error: string = '';
    accountFunding:any = false;

  constructor(private cartService: CartService, private route: ActivatedRoute, private storeService:StoreService) {
  }

  convertQueryStringToJson(queryString: string): any {
    const params = new URLSearchParams(queryString);
    const jsonObject: any = {};

    params.forEach((value, key) => {
      jsonObject[key] = value;
    });

    return jsonObject;
  }


  ngOnInit() {
    ///Get params from route
    this.route.queryParamMap.subscribe(params => {
      this.paymentRef = params.get('ref')
    });
    // this.paymentRef = this.route.snapshot.paramMap.get('ref');
    this.activeOrder = JSON.parse(localStorage.getItem('activeOrder')!);
    try {
      this.accountFunding = JSON.parse(localStorage.getItem('accountFunding')!);
    } catch (e) {
      console.error(e);
    }


    ///Check if the active order and paymentref match
    // if(this.paymentRef === this.activeOrder.invoice.paymentReference){
      if(this.activeOrder){
        /// poll paynow to confirm if payment was successful

      // const maxAttempts = 10; // Set max attempts
      // let attempts = 5;

      // const checkOrder$ = interval(3000) // Run every 3 seconds
      //   .pipe(
      //     switchMap(() => this.cartService.checkOrderFromPayNow(this.activeOrder.pollUrl)),
      //     takeWhile((response:any) => !(this.convertQueryStringToJson(response).status=='Paid') , true), // Stop if success is true
      //     take(maxAttempts) // Stop after max attempts
      //   )
      //   .subscribe({
      //     next: value => {
      //       console.log('Order status:', this.convertQueryStringToJson(value));
      //       let payNowResponse = this.convertQueryStringToJson(value);
      //
      //       if (payNowResponse.status === "Paid") {
      //         //Submit order to API
      //
      //        // Stop checking if order is successful
      //       }
      //     },
      //     error: err => {
      //       console.error('Error checking order:', err);
      //     },
      //     // complete: () => {
      //     //   console.log('Polling completed');
      //     // }
      //   });

        if(this.accountFunding){
          this.storeService.createIncomingPayment(this.activeOrder.payment).subscribe({
            next: (response:any) => {
              if(response){
                this.loading = false
                this.success = true;
                localStorage.removeItem("activeOrder")
                if(this.accountFunding){
                  localStorage.removeItem("accountFunding")
                }
                console.log('Order Paid!');
              }
            },
            error: error => {
              console.log(error);
              this.loading = false;
              this.success = false;
              this.error = error.error;
              Swal.fire({
                icon: "error",
                title: "Error",
                text: error.error
              })
            }
          })
        }else {
          this.cartService.createOrderApi(this.activeOrder.invoice).subscribe({
            next: (response:any) => {
              if(response){
                this.loading = false
                this.success = true;
                localStorage.removeItem("activeOrder")
                if(this.accountFunding){
                  localStorage.removeItem("accountFunding")
                }
                this.cartService.clearCart()
                console.log('Order Paid!');
              }
            },
            error: error => {
              console.log(error);
              this.loading = false;
              this.success = false;
              this.error = error.error;
              Swal.fire({
                icon: "error",
                title: "Error",
                text: error.error
              })
            }
          })
        }




    }

  }


  protected readonly Date = Date;
}
