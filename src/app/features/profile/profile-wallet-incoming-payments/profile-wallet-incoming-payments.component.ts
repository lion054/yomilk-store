import {Component, OnDestroy, OnInit} from '@angular/core';
import { DatePipe, DecimalPipe } from "@angular/common";
import {catchError, of, Subject, takeUntil} from "rxjs";
import {StoreService} from "../../../core/services/store/store.service";
import {Router, RouterModule} from "@angular/router";
import {AuthService} from "../../../core/services/auth/auth.service";

@Component({
  selector: 'app-profile-wallet-incoming-payments',
  standalone: true,
  imports: [
    RouterModule,
    DecimalPipe,
    DatePipe
],
  templateUrl: './profile-wallet-incoming-payments.component.html',
  styleUrl: './profile-wallet-incoming-payments.component.css'
})
export class ProfileWalletIncomingPaymentsComponent implements OnInit , OnDestroy {

  open: boolean = false;
  loadingBalance: boolean = false;
  // statements: any= {};
  pageNumber: number = 1; // Start at page 1
  pageSize: number = 20; // Default page size
  totalPages: number = 0; // Total pages to be set from response
  incomingPayments:any = {};

  loading: boolean = false;
  incomingPaymentsLoading: boolean = false;
  private destroy$ = new Subject<void>();
  protected businessPartnerDetails: any;

  constructor(private storeService: StoreService, private router:Router, private authService: AuthService) {}

  //Open invoice detail
  openStatement(invoice:any) {
    this.router.navigate(['profile/statement-detail'], { state: { data: invoice }, queryParams: { invoiceNum: invoice.DocEntry } }); //
  }

  ngOnInit() {
    // this.fetchStatements();
    this.fetchIncomingPayments();
    this.fetchBusinessPartnerDetails();
  }

  // fetchStatements() {
  //   this.loading = true;
  //   this.storeService.getStoreStatements()
  //     // .pipe(
  //     //   takeUntil(this.destroy$),
  //     //   catchError((error) => {
  //     //     console.error("Error fetching invoices:", error);
  //     //     this.loading = false;
  //     //     return of([]); // Fallback to empty array if there's an error
  //     //   })
  //     // )
  //     .subscribe((response: any) => {
  //       this.statements = response;
  //       this.loading = false;
  //
  //       console.log("STATEMENTS: ",this.statements)
  //     });
  // }


  fetchIncomingPayments() {
    this.loading = true;
    this.storeService.getStoreIncomingPayments(this.pageSize, this.pageNumber)
      // .pipe(
      //   takeUntil(this.destroy$),
      //   catchError((error) => {
      //     console.error("Error fetching invoices:", error);
      //     this.loading = false;
      //     return of([]); // Fallback to empty array if there's an error
      //   })
      // )
      .subscribe((response: any) => {
        this.incomingPayments = response;
        // sort by descending order
        // this.incomingPayments.values.sort((a: any, b: any) => new Date(b.DocDate).getTime() - new Date(a.DocDate).getTime());
        this.incomingPayments.values.sort((a: any, b: any) => b.DocNum - a.DocNum);``
        this.totalPages = response.pageCount; // Set total pages from response
        this.loading = false;

        console.log("INCOMING PAYMENTS: ",this.incomingPayments)
      });
  }

  fetchBusinessPartnerDetails() {
    this.loadingBalance = true;
    this.storeService.getBusinessPartnerDetails(this.authService.getAuthUser().customer?.cardCode)
      // .pipe(
      //   takeUntil(this.destroy$),
      //   catchError((error) => {
      //     console.error("Error fetching invoices:", error);
      //     this.loading = false;
      //     return of([]); // Fallback to empty array if there's an error
      //   })
      // )
      .subscribe((response: any) => {
        this.businessPartnerDetails = response;
        this.loadingBalance = false;

        console.log("Business Partner Details: ",this.businessPartnerDetails)
      });
  }

  // Method for navigating to the previous page
  goToPreviousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.fetchIncomingPayments(); // Load invoices for the new page number
    }
  }

  // Method for navigating to the next page
  goToNextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.fetchIncomingPayments(); // Load invoices for the new page number
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
