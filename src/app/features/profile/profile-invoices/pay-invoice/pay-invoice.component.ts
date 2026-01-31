import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import Swal from "sweetalert2";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {StoreService} from "../../../../core/services/store/store.service";
import {AuthService} from "../../../../core/services/auth/auth.service";
import {CartService} from "../../../../core/services/cart/cart.service";
import { DecimalPipe, NgStyle } from "@angular/common";
import {AnimatedPayCardComponent} from "../../../../components/animated-pay-card/animated-pay-card.component";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-pay-invoice',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    AnimatedPayCardComponent,
    NgStyle
],
  templateUrl: './pay-invoice.component.html',
  styleUrl: './pay-invoice.component.css'
})
export class PayInvoiceComponent implements OnInit {

  balance:any = 0;
  currency:any = 0;
  paymentMethod: any;

  checkoutForm = this._formBuilder.group({
    amount: ['',[Validators.required, Validators.min(1)]],
    paymentPhoneNumber: ['']
  });

  step: number = 1;
  loading: boolean = false;
  userDetails: any;
  innBucksResponse: any;
  userDetailsData:any;

  proToast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
  error: boolean = false;
  invoicNum: any;
  invoice: any;

  toggleEcoCashValidators(){
    const ecoCashControl:any = this.checkoutForm.get('paymentPhoneNumber')

    if(this.paymentMethod == "Ecocash"){
      ecoCashControl?.setValidators([Validators.required])
    }else {
      ecoCashControl?.clearValidators()
    }
    ecoCashControl.updateValueAndValidity();
  }

  constructor(
    private route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private storeService:StoreService,
    private authService:AuthService,
    private cartService: CartService,
    private router:Router,
  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params:any) => {
      this.balance = params['balance']
      this.currency = params['currency']

      ///Check if there is an invoice and payInvoice
      this.invoicNum = params['invoicNum']


      // this.userDetails = history.state.data.userDetails;
      this.invoice = history.state.data;

      console.log(this.balance);
      console.log(this.currency);
    })
    this.fetchBusinessPartnerDetails()
  }

  fetchBusinessPartnerDetails() {
    this.storeService.getBusinessPartnerDetails(this.authService.getAuthUser().customer?.cardCode)
      .subscribe((response: any) => {
        this.userDetailsData = response
        // this.loading = false;
        // this.checkoutForm.patchValue({
        //   email: response.emailAddress,
        //   mobileNumber: response.phone1,
        //   companyName: this.userDetails?.customer?.cardName,
        //   billAddressLine1: response.block,
        //   billCity: response.city
        // })
        console.log("Business Partner Details: ",this.userDetails);
      });
  }



  // Fund account logic
  fundAccount(){
    this.loading = true;
    const cardCode = this.authService.getAuthUser()?.customer?.cardCode;
    ///reference number based on Date
    const ref = new Date().toLocaleDateString("en-US");
    // Todo Add Ecocash payment number when ready
    // Get these from saved session details
    let payload = {
      cardCode: cardCode,// replace this with values from logged-in user
      docCurrency: this.invoice.DocCurrency,
      paymentReference: "",
      paymentCode: "",
      paymentPhoneNumber: "",
      paymentFullName: this.authService.getAuthUser()?.userName,
      email: this.authService.getAuthUser()?.userName,
      transferSum: this.checkoutForm.value.amount,
      paymentMethod: this.paymentMethod,
      returnUrl: `${environment.returnUrl}`,
      paymentInvoices: [
        this.invoice
      ]
    }

    if(this.paymentMethod.toLowerCase() === 'innbucks'){
      this.storeService.createOrderApiInnBucks(payload).subscribe((response:any) => {
          this.innBucksResponse = response;
          if(response.code){
            let checkTransPayload:any = {
              reference: response.payment.paymentReference,
              code: response.code
            }
            ///Check if the transaction was successful
            this.checkInnBucksTrans(checkTransPayload, response.payment);
          }
        },
        (error:any)=>{
          this.step = 3
          this.proToast.fire({
            icon: "error",
            title: "Something Went Wrong"
          });
        }
      )
    }else if(this.paymentMethod.toLowerCase() === 'ecocash') {
      this.storeService.createIncomingPayment(payload).subscribe((response:any)=>{
          console.log(response);
          this.loading = false;
          this.step = 3;
          if (response){
            this.proToast.fire({
              icon: "success",
              title: "Your Account has been funded successfully"
            });


            ///Navigate to invoice detail if user is logged in
            // Todo Maybe make this into a button the user can click
            if(!this.authService.getAuthUser().customer?.isVisitor){
              this.router.navigate(['/profile',], {
                queryParams: {invoiceNum: response.docEntry}
              });
            }


          }
          //Account successfully funded
        },
        (error:any)=>{
          console.log(error);
          this.loading = false;
          this.proToast.fire({
            icon: "error",
            title: "Account not funded"
          });

        }
      )
    }  else if(this.paymentMethod.toLowerCase() === 'paynow'){
      this.step = 4
      this.storeService.createOrderPayNow(payload).subscribe((response:any) => {
          // this.step = 5
          if (response){
            //save response
            localStorage.setItem('activeOrder',JSON.stringify(response));

            this.proToast.fire({
              timer: 1000,
              icon: "success",
              title: "Your order has been created successfully, redirecting to PayNow"
            }).then(()=>{
              window.open(response.redirectLink, "_blank");
            });
          }
        },
        (error:any)=>{
          this.step = 5
          this.error = true
          this.proToast.fire({
            title: "Something Went Wrong",
            icon: "error",
            text: error.error
          });
        }
      )

    } else {

    }


  }

  ///Check if Innbucks transaction was successful and fund account
  checkInnBucksTrans (payload: any, createPaymentPayload:any)  {
    let attempts = 0;
    const intervalId = setInterval(() => {
      this.cartService.checkInnBucksTransaction(payload).subscribe((finalInnBucksResponse: any) => {
        if (finalInnBucksResponse.status === 'Claimed') {
          this.storeService.createIncomingPayment(createPaymentPayload).subscribe((response:any)=>{
              console.log(response);
              this.loading = false;
              this.step = 3;
              if (response){
                this.proToast.fire({
                  icon: "success",
                  title: "Your invoice  has been paid successfully"
                }).then(()=>{
                  clearInterval(intervalId);
                  ///Navigate to profile detail
                  // Todo Maybe make this into a button the user can click
                  if(!this.authService.getAuthUser().customer?.isVisitor){
                    this.router.navigate(['/profile',], {
                      queryParams: {invoiceNum: response.docEntry}
                    });
                  }
                });

              }
              //Account successfully funded
            },
            (error:any)=>{
              console.log(error);
              this.loading = false;
              this.proToast.fire({
                icon: "error",
                title: "Payment successful but invoice not paid"
              });
              clearInterval(intervalId);
            }
          )
        }
      });

      attempts++;
      if (attempts >= 10) {
        this.error = true;
        clearInterval(intervalId);
        this.step = 5;
        // Stop after 10 attempts
        this.proToast.fire({
          icon: "error",
          title: "Payment failed"
        });
      }
    }, environment.innbucksInterval); // 15000 ms = 15 seconds
  };

  //Validate details before confirmation
  validateBeforeConfirm() {
    if(this.checkoutForm.valid && this.paymentMethod != null){
      this.step = 2
    }else {
      Object.keys(this.checkoutForm.controls).forEach(field => {
        const control = this.checkoutForm.get(field);
        control!.markAsTouched({ onlySelf: true });
      });
    }
  }
}
