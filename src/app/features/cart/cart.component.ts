import {catchError, of, Subject, Subscription, takeUntil} from 'rxjs';
import { CurrencyService } from './../../core/services/currency/currency.service';
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {CartItemComponent} from "../../components/cart/cart-item/cart-item.component";
import {FormBuilder, FormsModule, NgForm, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {CartService} from "../../core/services/cart/cart.service";
import Swal from "sweetalert2";
import {Router, RouterLink} from "@angular/router";
import {AuthService, UserSession} from "../../core/services/auth/auth.service";
import {StoreService} from "../../core/services/store/store.service";
import {AnimatedPayCardComponent} from "../../components/animated-pay-card/animated-pay-card.component";
import {environment} from "../../../environments/environment";
import {GeolocationService} from "../../core/services/location/geolocation.service";
import {StepperComponent} from "../../components/stepper/stepper.component";
import {City, Country, Suburb} from "../../core/interfaces/interfaces";
import {NgSelectComponent} from "@ng-select/ng-select";
import {ConfirmCartComponent} from "../../components/confirm-cart/confirm-cart.component";
import {CountryISO, NgxIntlTelInputModule, SearchCountryField} from "ngx-intl-tel-input";
import {WeekendNoticeComponent} from "../../components/weekend-notice/weekend-notice.component";
import {BreadcrumbComponent} from "../../components/breadcrumb/breadcrumb.component";
import {FeaturesStripComponent} from "../../components/features-strip/features-strip.component";




@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CartItemComponent,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AnimatedPayCardComponent,
    StepperComponent,
    NgSelectComponent,
    ConfirmCartComponent,
    NgxIntlTelInputModule,
    WeekendNoticeComponent,
    BreadcrumbComponent,
    FeaturesStripComponent
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  step = 1;
  separateShipping = false;
  cartItems: any[] = [];
  minimumOrderAmount: number = 15.00; // Set your minimum order amount
  activeCurrency: any;
  cartTotal: any;
  paymentMethod:any = ""

  // Scheduled delivery properties
  deliveryType: 'asap' | 'scheduled' = 'asap';
  scheduledDate: string = '';
  scheduledTimeSlot: string = '';
  availableTimeSlots: { value: string; label: string; available: boolean }[] = [];
  minDeliveryDate: string = '';
  maxDeliveryDate: string = '';
  paymentMethodChanges = new Subject<any>(); // Subject for tracking changes
  innBucksResponse:any;
   error: boolean = false;
   userDetails: UserSession | undefined;
   userDetailsData: any;
   isVisitor: any = true;
   countries: Country[] = [];
   isPreview: boolean = false;

  // Filtered lists for dropdowns
  billCities: City[] = [];
  billSuburbs: Suburb[] = [];
  shipCities: City[] = [];
  shipSuburbs: Suburb[] = [];
  cartPreview: any ;
  isPreviewLoading: boolean = false;

  updateBillCities(countryCode: string): void {
    const country = this.countries.find(c => c.countryCode === countryCode);
    this.billCities = country ? country.cities : [];
    this.checkoutForm.get('billCity')?.setValue('');
    this.billSuburbs = [];
  }

  updateBillSuburbs(cityName: string): void {
    const country = this.countries.find(c => c.countryCode === this.checkoutForm.get('billCountry')?.value);
    if (country) {
      const city = country.cities.find(c => c.name === cityName);
      this.billSuburbs = city ? city.suburbs : [];
      this.checkoutForm.get('billSuburb')?.setValue('');
      this.billSuburbs.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
    }
  }

  updateShipCities(countryCode: string): void {
    const country = this.countries.find(c => c.countryCode === countryCode);
    this.shipCities = country ? country.cities : [];
    this.checkoutForm.get('shipCity')?.setValue('');
    this.shipSuburbs = [];
  }

  updateShipSuburbs(cityName: string): void {
    const country = this.countries.find(c => c.countryCode === this.checkoutForm.get('shipCountry')?.value);
    if (country) {
      const city = country.cities.find(c => c.name === cityName);
      this.shipSuburbs = city ? city.suburbs : [];
      this.checkoutForm.get('shipSuburb')?.setValue('');
      this.shipSuburbs.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
    }
  }

  onSeparateShippingChange(): void {
    if (this.separateShipping) {
      this.checkoutForm.get('shipAddressLine1')?.setValidators(Validators.required);
      this.checkoutForm.get('shipCountry')?.setValidators(Validators.required);
      this.checkoutForm.get('shipCity')?.setValidators(Validators.required);
    } else {
      this.checkoutForm.get('shipAddressLine1')?.clearValidators();
      this.checkoutForm.get('shipCountry')?.clearValidators();
      this.checkoutForm.get('shipCity')?.clearValidators();
    }

    this.checkoutForm.get('shipAddressLine1')?.updateValueAndValidity();
    this.checkoutForm.get('shipCountry')?.updateValueAndValidity();
    this.checkoutForm.get('shipCity')?.updateValueAndValidity();
  }


  constructor(private cartService: CartService, private CurrencyService:CurrencyService, private _formBuilder: FormBuilder, private router: Router, private authService:AuthService, private storeService:StoreService, private deliveryZoneService: GeolocationService) {
   this.isVisitor =  authService.getAuthUser().customer?.isVisitor;
    // Subscribe to the Subject
    this.paymentMethodChanges.subscribe(method => {
      this.toggleEcoCashValidators();
    });
  }

  checkoutForm:any = this._formBuilder.group({
    firstName: ['',[Validators.required]],
    lastName: ['',[Validators.required]],
    secondName: [''],
    email: ['',[Validators.required,Validators.email]],
    companyName: [''],
    mobileNumber: ['',[Validators.required]],
    billAddressLine1: ['',[Validators.required]],
    billAddressLine2: [''],
    billCity: ['Harare',[Validators.required]],
    billSuburb: ['', [Validators.required]],
    billCountry: ['', [Validators.required]],
    billCountryCode: [''],
    billCountryName: [''],
    shipAddressLine1: [''],
    shipAddressLine2: [''],
    shipCity: ['Harare',[Validators.required]],
    shipSuburb: ['', [Validators.required]],
    shipCountry: ['', [Validators.required]],
    shipCountryCode: [''],
    shipCountryName: [''],
    paymentPhoneNumber: ['']
  });

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

  toggleEcoCashValidators(){
    const ecoCashControl = this.checkoutForm.get('paymentPhoneNumber')

    if(this.paymentMethod == "Ecocash"){
      ecoCashControl?.setValidators([Validators.required])
    }else {
      ecoCashControl?.clearValidators()
      ecoCashControl.updateValueAndValidity();
      this.previewOrder()
    }
    ecoCashControl.updateValueAndValidity();

  }


  ngOnInit() {
    window.scrollTo(0, 0);
    this.initializeDeliveryDates(); // Initialize scheduled delivery dates

    this.CurrencyService.selectedCurrency$.subscribe((currency:any) => {
      this.activeCurrency = currency;
    });

    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });

    // Set up on change listener for mobile number
    this.checkoutForm.get('mobileNumber')?.valueChanges.subscribe((value: string) => {
      this.checkoutForm.patchValue({
        paymentPhoneNumber: value
      })
    });

    //Get location information
    this.deliveryZoneService.getDeliveryZonesNoGeolocations().subscribe({
      next: (data:any) => {
        this.countries = data;
        // Set up validators for shipping address when checkbox is toggled
        this.checkoutForm.get('billCountry')?.valueChanges.subscribe((countryCode: string) => {
          this.checkoutForm.patchValue({
            billCountryCode: countryCode,
            billCountryName:countryCode
          })
          this.updateBillCities(countryCode);
        });

        this.checkoutForm.get('billCity')?.valueChanges.subscribe((cityName:string) => {
          this.updateBillSuburbs(cityName);
        });

        this.checkoutForm.get('shipCountry')?.valueChanges.subscribe((countryCode:string) => {
          this.checkoutForm.patchValue({
            shipCountryCode: countryCode,
            shipCountryName: countryCode
          })
          this.updateShipCities(countryCode);
        });

        this.checkoutForm.get('shipCity')?.valueChanges.subscribe((cityName:string) => {
          this.updateShipSuburbs(cityName);
        });

        this.checkoutForm.patchValue({
          billCountry: this.countries[0].countryCode,
          billCity: this.countries[0].cities[0].name,
          shipCountry: this.countries[0].countryCode,
          shipCity: this.countries[0].cities[0].name,
        })
      },
      error: error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error.message,
        })
       console.error(error);
      }
    })



    this.cartService.calcTotal()
    this.cartService.cartTotal$.subscribe((total:any) => {
      this.cartTotal = total;
    })

    ///Check if user is logged in and auto populate details
    this.userDetails =  this.authService.getAuthUser();

    if(!(this.userDetails.customer?.isVisitor)){

      this.fetchBusinessPartnerDetails()
    }


  }

  fetchBusinessPartnerDetails() {
    this.storeService.getBusinessPartnerDetails(this.authService.getAuthUser().customer?.cardCode)
      .subscribe((response: any) => {
        this.userDetailsData = response
        // this.loading = false;
        this.checkoutForm.patchValue({
            email: response.emailAddress,
            mobileNumber: response.phone1,
            paymentPhoneNumber: response.phone1,
            companyName: this.userDetails?.customer?.cardName,
            billAddressLine1: response.bpAddresses[0].block,
            billCity: response.city,
            billCountry: response.country

        })

        console.log("Business Partner Details: ",this.userDetails);
      });
  }

  // Initialize delivery date constraints
  initializeDeliveryDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Min date is tomorrow
    this.minDeliveryDate = this.formatDateForInput(tomorrow);

    // Max date is 14 days from now
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 14);
    this.maxDeliveryDate = this.formatDateForInput(maxDate);

    // Set default scheduled date to tomorrow
    this.scheduledDate = this.minDeliveryDate;
    this.updateTimeSlots();
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDeliveryTypeChange(type: 'asap' | 'scheduled') {
    this.deliveryType = type;
    if (type === 'scheduled' && !this.scheduledDate) {
      this.initializeDeliveryDates();
    }
  }

  onScheduledDateChange() {
    this.updateTimeSlots();
    this.scheduledTimeSlot = ''; // Reset time slot when date changes
  }

  updateTimeSlots() {
    const selectedDate = new Date(this.scheduledDate);
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    const currentHour = today.getHours();

    // Define base time slots (6am to 6pm based on business hours)
    const baseSlots = [
      { value: '06:00-08:00', label: '6:00 AM - 8:00 AM', startHour: 6 },
      { value: '08:00-10:00', label: '8:00 AM - 10:00 AM', startHour: 8 },
      { value: '10:00-12:00', label: '10:00 AM - 12:00 PM', startHour: 10 },
      { value: '12:00-14:00', label: '12:00 PM - 2:00 PM', startHour: 12 },
      { value: '14:00-16:00', label: '2:00 PM - 4:00 PM', startHour: 14 },
      { value: '16:00-18:00', label: '4:00 PM - 6:00 PM', startHour: 16 },
    ];

    this.availableTimeSlots = baseSlots.map(slot => ({
      value: slot.value,
      label: slot.label,
      // If today, only show slots that are at least 2 hours in the future
      available: !isToday || slot.startHour > currentHour + 2
    }));
  }

  getFormattedScheduledDate(): string {
    if (!this.scheduledDate) return '';
    const date = new Date(this.scheduledDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isScheduledDeliveryValid(): boolean {
    if (this.deliveryType === 'asap') return true;
    return !!this.scheduledDate && !!this.scheduledTimeSlot;
  }

  removeItem(index: number) {
    this.cartService.removeFromCart(index);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  nextStep() {
    // get current step and validate if the for is valid else trigger validation for those fields
    switch (this.step) {
      case 1:
        if (this.checkoutForm.get('firstName')?.valid
          && this.checkoutForm.get('lastName')?.valid
          && this.checkoutForm.get('email')?.valid
          && this.checkoutForm.get('mobileNumber')?.valid
        ) {
          this.step++;
        } else {
          // Only mark those controls as touched that are invalid
          this.checkoutForm.get('firstName')?.markAsTouched();
          this.checkoutForm.get('lastName')?.markAsTouched();
          this.checkoutForm.get('email')?.markAsTouched();
          this.checkoutForm.get('mobileNumber')?.markAsTouched();

          // this.checkoutForm.markAllAsTouched();
          // Swal.fire({
          //   icon: 'error',
          //   title: 'Error',
          //   text: 'Please fill out all required fields.'
          // });
        }
        break;
      case 2:
        if (this.checkoutForm.get('billAddressLine1')?.valid
          && this.checkoutForm.get('billCity')?.valid
          && this.checkoutForm.get('billSuburb')?.valid
          && this.checkoutForm.get('billCountry')?.valid
        ) {
          if (this.separateShipping) {
            if (this.checkoutForm.get('shipAddressLine1')?.valid
              && this.checkoutForm.get('shipCity')?.valid
              && this.checkoutForm.get('shipSuburb')?.valid
              && this.checkoutForm.get('shipCountry')?.valid) {
              this.step++;
            } else {
              // Only mark those controls as touched that are invalid
              this.checkoutForm.get('shipAddressLine1')?.markAsTouched();
              this.checkoutForm.get('shipCity')?.markAsTouched();
              this.checkoutForm.get('shipSuburb')?.markAsTouched();
              this.checkoutForm.get('shipCountry')?.markAsTouched();
            }
          } else {
            this.step++;
          }
        } else {
          // Only mark those controls as touched that are invalid
          this.checkoutForm.get('billAddressLine1')?.markAsTouched();
          this.checkoutForm.get('billCity')?.markAsTouched();
          this.checkoutForm.get('billSuburb')?.markAsTouched();
          this.checkoutForm.get('billCountry')?.markAsTouched();
        }
        break;

      default:
        // this.step++;
        break;
    }




    // if (this.step < 3) {
    //   this.step++;
    // }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  retry(){
    this.prevStep();
    this.error = false;
    this.innBucksResponse = null;
    this.createOrder();
  }


  ///Generates an order to send to the API
  createOrder() {
    window.scrollTo(0, 0);
    this.isPreview = false;
    this.step = 4
    let documentLines: any[] = [];
    // function addDocumentLines(item:any, index:number){
    //   const lineItem:any = {
    //     "lineNum": index,
    //     "itemCode": item.itemCode,
    //     "itemDescription": item.itemName,
    //     "quantity": item.quantity,
    //     "priceAfterVAT": item.uom.price,
    //     "warehouseCode": item.warehouseCode,
    //     "vatGroup": item.salesVATGroup,
    //     "vatRate": item.salesVATRate,
    //     "text": null,
    //     "uoMEntry": item.uom.uomEntry,
    //     "uoMCode": null
    //   }
    //   documentLines.push(lineItem)
    // }

    if(!this.separateShipping){
      this.checkoutForm.patchValue({shipAddressLine1: this.checkoutForm.value.billAddressLine1})
      this.checkoutForm.patchValue({shipCountry: this.checkoutForm.value.billCountry})
      this.checkoutForm.patchValue({shipCity: this.checkoutForm.value.billCity})
      this.checkoutForm.patchValue({shipSuburb: this.checkoutForm.value.billSuburb})
      console.log(this.checkoutForm.value)
    }


    // const activeSuburb: Suburb | any = this.billSuburbs.find((burb: Suburb) => burb.name === this.checkoutForm.value.billSuburb)



    const checkInnBucksTrans = (payload: any, submitInvoicePayload:any) => {
      let attempts = 0;
      const intervalId = setInterval(() => {
        this.cartService.checkInnBucksTransaction(payload).subscribe((finalInnBucksResponse: any) => {
          if (finalInnBucksResponse.status === 'Claimed') {

            this.cartService.createOrderApi(submitInvoicePayload).subscribe((response:any) => {
                this.step = 5
                if (response){
                  this.proToast.fire({
                    icon: "success",
                    title: "Your order has been created successfully"
                  });
                  clearInterval(intervalId);

                  ///Navigate to invoice detail if user is logged in
                  // Todo Maybe make this into a button the user can click
                  if(!this.authService.getAuthUser().customer?.isVisitor){
                    this.router.navigate(['/profile/invoice-detail',], {
                      queryParams: {invoiceNum: response.docEntry}
                    });
                  }


                }
              },
              (error:any)=>{
                this.step = 5
                this.error = true;
                this.proToast.fire({
                  icon: "error",
                  title: "Payment successful but order  not created"
                });
                clearInterval(intervalId);
              },
              ()=>{
                // this.step = 5;
                // this.proToast.fire({
                //   icon: "success",
                //   title: "Your order has been created successfully"
                // });
                clearInterval(intervalId); // Stop further checks if payment is successful
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


    if(this.checkoutForm.valid){

      this.step = 4
      let payload:any = {
        cartId: this.cartPreview.cartId
      }

      if(this.paymentMethod.toLowerCase() === 'innbucks'){
        this.cartService.createOrderApiInnBucks(payload).subscribe({
          next: (response:any) => {
                this.innBucksResponse = response;

                if(response.code){
                  let checkTransPayload:any = {
                    reference: response.invoice.paymentReference,
                    code: response.code
                  }
                  ///Check if the transaction was successful
                  checkInnBucksTrans.call(this,checkTransPayload, response.invoice);
                }
          },
          error:(error:any) => {
            this.step = 3
            this.proToast.fire({
              icon: "error",
              title: error.error
            });
          }
        })
      }else if(this.paymentMethod.toLowerCase() === 'ecocash'){
          this.step = 4
        this.cartService.createOrderApi(payload).subscribe((response:any) => {
            this.step = 5
            if (response){
              this.clearCart()
              this.proToast.fire({
                icon: "success",
                title: "Your order has been created successfully"
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

      }
      else if(this.paymentMethod.toLowerCase() === 'paynow'){
        this.step = 4
        this.cartService.createOrderPayNow(payload).subscribe((response:any) => {

            if (response.redirectLink){
              //save response
              localStorage.setItem('activeOrder',JSON.stringify(response));

              this.proToast.fire({
                icon: "success",
                title: "Your order has been created successfully, redirecting to PayNow"
              }).then(()=>{
                this.clearCart()
                window.open(response.redirectLink, "_blank");
                // window.open(response.redirectLink, "_self");

              });
            }else {
              this.step = 5
              this.error = true
              this.proToast.fire({
                title: "Something Went Wrong",
                icon: "error",
                text: response.message
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

      }

    //Cash on delivery and pay on account
      else {
        this.cartService.createOrderApi(payload).subscribe((response:any) => {
            this.step = 5
            if (response){
              this.clearCart()
              this.proToast.fire({
                icon: "success",
                title: "Your order has been created successfully"
              });
            }
          },
          (error:any)=>{
            this.step = 3

            Swal.fire({
              title: "Error",
              icon: "error",
              text: error.error
            })

            // this.proToast.fire({
            //   icon: "error",
            //   title: error.error
            // });
          }
        )
      }


    } else {

      let missingControls: string[] = [];

      Object.keys(this.checkoutForm.controls).forEach(field => {
        const control = this.checkoutForm.get(field);
        if (control && control.invalid) {
          missingControls.push(field); // Collect invalid fields
          control.markAsTouched({ onlySelf: true });
        }
      });

      if (missingControls.length > 0) {
        this.proToast.fire({
          icon: 'error',
          title: "Fill out required details",
          text: `Missing: ${missingControls.join(', ')}` // Display missing fields
        });
      }

    }


  }

///Previews an order first before creating
  previewOrder(){

    if(!this.validOrderAmount){
      Swal.fire({
        icon: 'warning',
        title: 'Minimum Order Amount',
        text: `Your order must be at least $${this.minimumOrderAmount.toFixed(2)}`,
        timer: 3000,
        showConfirmButton: false
      })
      return;
    }

    let documentLines: any[] = [];
    function addDocumentLines(item:any, index:number){
      const lineItem:any = {
        "lineNum": index,
        "itemCode": item.itemCode,
        "itemDescription": item.itemName,
        "quantity": item.quantity,
        "priceAfterVAT": item.uom.price,
        "warehouseCode": item.warehouseCode,
        "vatGroup": item.salesVATGroup,
        "vatRate": item.salesVATRate,
        "text": null,
        "uoMEntry": item.uom.uomEntry,
        "uoMCode": null
      }
      documentLines.push(lineItem)
    }

    if(!this.separateShipping){
      this.checkoutForm.patchValue({shipAddressLine1: this.checkoutForm.value.billAddressLine1})
      this.checkoutForm.patchValue({shipCountry: this.checkoutForm.value.billCountry})
      this.checkoutForm.patchValue({shipCity: this.checkoutForm.value.billCity})
      this.checkoutForm.patchValue({shipSuburb: this.checkoutForm.value.billSuburb})
      console.log(this.checkoutForm.value)
    }


    const activeSuburb: Suburb | any = this.billSuburbs.find((burb: Suburb) => burb.name === this.checkoutForm.value.billSuburb)



    const checkInnBucksTrans = (payload: any, submitInvoicePayload:any) => {
      let attempts = 0;
      const intervalId = setInterval(() => {
        this.cartService.checkInnBucksTransaction(payload).subscribe((finalInnBucksResponse: any) => {
          if (finalInnBucksResponse.status === 'Claimed') {

            this.cartService.createOrderApi(submitInvoicePayload).subscribe((response:any) => {
                this.step = 5
                if (response){
                  this.proToast.fire({
                    icon: "success",
                    title: "Your order has been created successfully"
                  });
                  clearInterval(intervalId);

                  ///Navigate to invoice detail if user is logged in
                  // Todo Maybe make this into a button the user can click
                  if(!this.authService.getAuthUser().customer?.isVisitor){
                    this.router.navigate(['/profile/invoice-detail',], {
                      queryParams: {invoiceNum: response.docEntry}
                    });
                  }


                }
              },
              (error:any)=>{
                this.step = 5
                this.error = true;
                this.proToast.fire({
                  icon: "error",
                  title: "Payment successful but order  not created"
                });
                clearInterval(intervalId);
              },
              ()=>{
                // this.step = 5;
                // this.proToast.fire({
                //   icon: "success",
                //   title: "Your order has been created successfully"
                // });
                clearInterval(intervalId); // Stop further checks if payment is successful
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


    if(this.checkoutForm.valid){

      this.isPreviewLoading = true;



      this.cartItems.forEach(addDocumentLines)

      let  billingAddress = {
        "firstName": this.checkoutForm.value.firstName,
        "secondName": this.checkoutForm.value.secondName,
        "lastName":  this.checkoutForm.value.lastName,
        "companyName":  this.checkoutForm.value.companyName,
        "addressLine1": this.checkoutForm.value.billAddressLine1,
        "addressLine2": this.checkoutForm.value.billAddressLine2,
        "suburb": this.checkoutForm.value.billSuburb,
        "city": this.checkoutForm.value.billCity,
        "country": this.checkoutForm.value.billCountry,
        "phoneNumber": this.checkoutForm.value.mobileNumber.e164Number?.toString(),
        "latitude": "",
        "longitude": "",
        "countryCode": this.checkoutForm.value.billCountry,
        "countryName": this.checkoutForm.value.billCountry,
      }

      let shippingAddress
      if(this.separateShipping){

        const shippingSuburb: Suburb | any = this.shipSuburbs.find((burb: Suburb) => burb.name === this.checkoutForm.value.shipSuburb)

        shippingAddress = {
          "firstName": this.checkoutForm.value.firstName,
          "secondName": this.checkoutForm.value.secondName,
          "lastName": this.checkoutForm.value.lastName,
          "companyName": this.checkoutForm.value.companyName,
          "addressLine1": this.checkoutForm.value.shipAddressLine1,
          "addressLine2": this.checkoutForm.value.shipAddressLine2,
          "city": this.checkoutForm.value.shipCity,
          "suburb": this.checkoutForm.value.shipSuburb,
          "country": "ZW",
          "phoneNumber": this.checkoutForm.value.mobileNumber.e164Number?.toString(),
          "latitude": "",
          "longitude": "",
          "countryCode": this.checkoutForm.value.shipCountryCode,
          "countryName": this.checkoutForm.value.shipCountryName,
        }
      }else {
        shippingAddress = billingAddress
      }

      // Build delivery schedule comments
      let deliveryComments = '';
      if (this.deliveryType === 'scheduled' && this.scheduledDate && this.scheduledTimeSlot) {
        deliveryComments = `SCHEDULED DELIVERY: ${this.getFormattedScheduledDate()} between ${this.scheduledTimeSlot}`;
      }

      let payload = {
        "docCurrency": this.activeCurrency.code,
        "comments": deliveryComments,
        "paymentReference": "",
        "paymentMethod": this.paymentMethod,
        "documentLines": documentLines,
        "billToAddress": billingAddress,
        "shipToAddress": shippingAddress,
        "paymentPhoneNumber": this.checkoutForm.value.paymentPhoneNumber.e164Number,
        "paymentFullName": this.checkoutForm.value.firstName+this.checkoutForm.value.lastName,
        "returnUrl": `${environment.returnUrl}`,
        "deliveryType": this.deliveryType,
        "scheduledDate": this.deliveryType === 'scheduled' ? this.scheduledDate : null,
        "scheduledTimeSlot": this.deliveryType === 'scheduled' ? this.scheduledTimeSlot : null,
      }

      console.log("Final Payload: ", payload);


      ///Preview order first
      this.cartService.previewCart(payload).subscribe({
        next: (response) => {
            this.isPreviewLoading = false;
            this.cartPreview = response;
            this.isPreview = true;
        },
        error: error => {
          this.isPreviewLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `${error.error?? "Something went wrong"}`,
          })
        }
      })





      // if(this.paymentMethod.toLowerCase() === 'innbucks'){
      //   this.cartService.createOrderApiInnBucks(payload).subscribe((response:any) => {
      //
      //       this.innBucksResponse = response;
      //
      //       if(response.code){
      //         let checkTransPayload:any = {
      //           reference: response.invoice.paymentReference,
      //           code: response.code
      //         }
      //         ///Check if the transaction was successful
      //         checkInnBucksTrans.call(this,checkTransPayload, response.invoice);
      //       }
      //
      //       // this.step = 5
      //
      //
      //       // if (response){
      //       //   this.proToast.fire({
      //       //     icon: "success",
      //       //     title: "Your order has been created successfully"
      //       //   });
      //       // }
      //     },
      //     (error:any)=>{
      //       this.step = 3
      //       this.proToast.fire({
      //         icon: "error",
      //         title: "Something Went Wrong"
      //       });
      //     }
      //   )
      // }else if(this.paymentMethod.toLowerCase() === 'ecocash'){
      //   this.step = 4
      //   this.cartService.createOrderApi(payload).subscribe((response:any) => {
      //       this.step = 5
      //       if (response){
      //         this.proToast.fire({
      //           icon: "success",
      //           title: "Your order has been created successfully"
      //         });
      //       }
      //     },
      //     (error:any)=>{
      //       this.step = 5
      //       this.error = true
      //       this.proToast.fire({
      //         title: "Something Went Wrong",
      //         icon: "error",
      //         text: error.error
      //       });
      //     }
      //   )
      //
      // }
      // else if(this.paymentMethod.toLowerCase() === 'paynow'){
      //   this.step = 4
      //   this.cartService.createOrderPayNow(payload).subscribe((response:any) => {
      //       // this.step = 5
      //       if (response){
      //         //save response
      //         localStorage.setItem('activeOrder',JSON.stringify(response));
      //
      //         this.proToast.fire({
      //           icon: "success",
      //           title: "Your order has been created successfully, redirecting to PayNow"
      //         }).then(()=>{
      //           window.open(response.redirectLink, "_blank");
      //           // window.open(response.redirectLink, "_self");
      //
      //         });
      //       }
      //     },
      //     (error:any)=>{
      //       this.step = 5
      //       this.error = true
      //       this.proToast.fire({
      //         title: "Something Went Wrong",
      //         icon: "error",
      //         text: error.error
      //       });
      //     }
      //   )
      //
      // }
      //
      // //Cash on delivery and pay on account
      // else {
      //   this.cartService.createOrderApi(payload).subscribe((response:any) => {
      //       this.step = 5
      //       if (response){
      //         this.proToast.fire({
      //           icon: "success",
      //           title: "Your order has been created successfully"
      //         });
      //       }
      //     },
      //     (error:any)=>{
      //       this.step = 3
      //
      //       Swal.fire({
      //         title: "Error",
      //         icon: "error",
      //         text: error.error
      //       })
      //
      //       // this.proToast.fire({
      //       //   icon: "error",
      //       //   title: error.error
      //       // });
      //     }
      //   )
      // }


    } else {

      let missingControls: string[] = [];

      Object.keys(this.checkoutForm.controls).forEach(field => {
        const control = this.checkoutForm.get(field);
        if (control && control.invalid) {
          missingControls.push(field); // Collect invalid fields
          control.markAsTouched({ onlySelf: true });
        }
      });

      if (missingControls.length > 0) {
        this.proToast.fire({
          icon: 'error',
          title: "Fill out required details",
          text: `Missing: ${missingControls.join(', ')}` // Display missing fields
        });
      }

    }


  }


  changeStep(step: any) {

    switch (this.step) {
      case 1:
        if (this.checkoutForm.get('firstName')?.valid
          && this.checkoutForm.get('lastName')?.valid
          && this.checkoutForm.get('email')?.valid
          && this.checkoutForm.get('mobileNumber')?.valid
        ) {
          this.step = step;
        } else {
          // Only mark those controls as touched that are invalid
          this.checkoutForm.get('firstName')?.markAsTouched();
          this.checkoutForm.get('lastName')?.markAsTouched();
          this.checkoutForm.get('email')?.markAsTouched();
          this.checkoutForm.get('mobileNumber')?.markAsTouched();

          // this.checkoutForm.markAllAsTouched();
          // Swal.fire({
          //   icon: 'error',
          //   title: 'Error',
          //   text: 'Please fill out all required fields.'
          // });
        }
        break;
      case 2:
        if (this.checkoutForm.get('billAddressLine1')?.valid
          && this.checkoutForm.get('billCity')?.valid
          && this.checkoutForm.get('billSuburb')?.valid
          && this.checkoutForm.get('billCountry')?.valid
        ) {
          if (this.separateShipping) {
            if (this.checkoutForm.get('shipAddressLine1')?.valid
              && this.checkoutForm.get('shipCity')?.valid
              && this.checkoutForm.get('shipSuburb')?.valid
              && this.checkoutForm.get('shipCountry')?.valid) {
              this.step = step;
            } else {
              // Only mark those controls as touched that are invalid
              this.checkoutForm.get('shipAddressLine1')?.markAsTouched();
              this.checkoutForm.get('shipCity')?.markAsTouched();
              this.checkoutForm.get('shipSuburb')?.markAsTouched();
              this.checkoutForm.get('shipCountry')?.markAsTouched();
            }
          } else {
            this.step = step;
          }
        } else {
          // Only mark those controls as touched that are invalid
          this.checkoutForm.get('billAddressLine1')?.markAsTouched();
          this.checkoutForm.get('billCity')?.markAsTouched();
          this.checkoutForm.get('billSuburb')?.markAsTouched();
          this.checkoutForm.get('billCountry')?.markAsTouched();
        }
        break;
      default:
        // this.step++;
        break;
    }
  }

  get subtotal(): number {
    // return this.cartPreview?.documentLines.reduce((sum:any, line:any) => sum + line.lineTotal, 0) || 0;
    return this.cartPreview?.documentLines.reduce((sum:any, line:any) => sum + line.lineTotal, 0) || 0;
  }

  get additionalExpensesTotal(): number {
    // return this.cartPreview?.additionalExpenses.reduce((sum:any, expense:any) => sum + expense.lineTotal, 0) || 0;
    return this.cartPreview?.additionalExpenses.reduce((sum:any, expense:any) => sum + expense.lineTotalAfterVAT, 0) || 0;
  }


  protected readonly SearchCountryField = SearchCountryField;
  protected readonly CountryISO = CountryISO;

  cancelOrder() {
    /// Closes all active subscriptions
this.isPreview = false;
this.step = 3
    this.isPreviewLoading = false;

  }

  get validOrderAmount(): boolean {
    return this.cartTotal >= this.minimumOrderAmount
  }


  // In your component
  trackByFn(index: number, item: any): any {
    return item.itemCode // Use unique identifier, NOT index
  }
}
