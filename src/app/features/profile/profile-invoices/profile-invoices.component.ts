import {Component, OnDestroy, OnInit} from '@angular/core';
import {DatePipe, NgIf} from "@angular/common";
import {StoreService} from "../../../core/services/store/store.service";
import {catchError, of, Subject, takeUntil} from "rxjs";
import {Router, RouterModule} from "@angular/router";

@Component({
  selector: 'app-profile-invoices',
  standalone: true,
  imports: [
    NgIf,
    RouterModule,
    DatePipe
  ],
  templateUrl: './profile-invoices.component.html',
  styleUrl: './profile-invoices.component.css'
})
export class ProfileInvoicesComponent implements OnInit , OnDestroy{
  open: boolean = false;
  invoices: any[] = []
  pageNumber: number = 1; // Start at page 1
  pageSize: number = 20; // Default page size
  totalPages: number = 0; // Total pages to be set from response
  loading: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private storeService: StoreService, private router:Router) {}

  //Open invoice detail
  openInvoice(invoice:any) {
    this.router.navigate(['profile/invoice-detail'], { state: { data: invoice }, queryParams: { invoiceNum: invoice.DocEntry } }); //
  }

  ///Pay invoice on pay page
  payInvoice(invoice:any) {
    this.router.navigate(['profile/pay-invoice'], { state: { data: invoice }, queryParams: { invoiceNum: invoice.DocEntry } }); //
  }

  ngOnInit() {
    this.fetchInvoices();
  }

  fetchInvoices() {
    this.loading = true;
    this.storeService.getStoreInvoices(this.pageSize, this.pageNumber)
      // .pipe(
      //   takeUntil(this.destroy$),
      //   catchError((error) => {
      //     console.error("Error fetching invoices:", error);
      //     this.loading = false;
      //     return of([]); // Fallback to empty array if there's an error
      //   })
      // )
      // .subscribe((response: any) => {
      //   this.invoices = response.values;
      //   this.loading = false;
      //
      //   console.log("INVOICES: ",this.invoices)
      // });
      .subscribe({
        next: (response:any) => {
          this.invoices = response.values; // Assign the invoices from values array
          // sort by descending order
          // this.invoices.sort((a, b) => new Date(b.DocDate).getTime() - new Date(a.DocDate).getTime());
          this.invoices.sort((a, b) => b.DocNum - a.DocNum);
          // DocNum

          this.totalPages = response.pageCount; // Set total pages from response
          this.loading = false; // Reset loading state
        },
        error: (error) => {
          console.error('Error loading invoices', error);
          this.loading = false; // Reset loading state on error
        }
      });
  }

  // Method for navigating to the previous page
  goToPreviousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.fetchInvoices(); // Load invoices for the new page number
    }
  }

  // Method for navigating to the next page
  goToNextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.fetchInvoices(); // Load invoices for the new page number
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
