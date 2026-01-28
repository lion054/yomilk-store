import {Component, OnDestroy, OnInit} from '@angular/core';
import {catchError, of, Subject, takeUntil} from "rxjs";
import {StoreService} from "../../../core/services/store/store.service";
import {Router, RouterLink} from "@angular/router";
import {CurrencyPipe, DecimalPipe, NgClass, NgIf, NgOptimizedImage} from "@angular/common";
import {AuthService} from "../../../core/services/auth/auth.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    NgIf,
    RouterLink,
    ReactiveFormsModule,
    NgClass,
    NgOptimizedImage,
    CurrencyPipe
  ],
  templateUrl: './profile-detail.component.html',
  styleUrl: './profile-detail.component.css'
})
export class ProfileDetailComponent implements OnInit , OnDestroy{

  detailsForm: FormGroup;
  open: boolean = false;
  businessPartnerDetails: any ={}
  loading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private storeService: StoreService, private authService: AuthService,private fb: FormBuilder, private router:Router) {
    this.detailsForm = this.fb.group({
      cardCode: ['', Validators.required],
      cardName: ['', Validators.required],
      address: ['', Validators.required],
      phone1: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
    });
  }

  // //Open invoice detail
  // openInvoice(invoice:any) {
  //   this.router.navigate(['profile/invoice-detail'], { state: { data: invoice }, queryParams: { invoiceNum: invoice.DocEntry } }); //
  // }

  ngOnInit() {

    this.fetchBusinessPartnerDetails();
  }


  navigateToFundWallet() {
    this.router.navigate(['/profile/wallet/fund'], {
      queryParams: {
        balance: this.businessPartnerDetails?.currentAccountBalance,
        currency: this.businessPartnerDetails?.currency
      },
      state: { data: this.businessPartnerDetails },
    });
  }

  populateForm() {
    this.detailsForm.patchValue(this.businessPartnerDetails);
  }

  onSubmit() {
    if (this.detailsForm.valid) {
      console.log('Form Submitted:', this.detailsForm.value);
      // Todo Add profile update when ready



    } else {
      console.log('Form is invalid');
    }
  }

  fetchBusinessPartnerDetails() {
    this.loading = true;
    this.storeService.getBusinessPartnerDetails(this.authService.getAuthUser().customer?.cardCode)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error("Error fetching invoices:", error);
          this.loading = false;
          return of([]); // Fallback to empty array if there's an error
        })
      )
      .subscribe((response: any) => {
        this.businessPartnerDetails = response;
        this.loading = false;
        this.populateForm();

        console.log("Business Partner Details: ",this.businessPartnerDetails)
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
