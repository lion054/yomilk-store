import {Component, OnDestroy, OnInit} from '@angular/core';
import {catchError, of, Subject, takeUntil} from "rxjs";
import {StoreService} from "../../../core/services/store/store.service";
import {Router, RouterModule} from "@angular/router";
import { DecimalPipe } from "@angular/common";
import {FormsModule} from "@angular/forms";
import {AuthService} from "../../../core/services/auth/auth.service";

@Component({
  selector: 'app-profile-statements',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    DecimalPipe
],
  templateUrl: './profile-statements.component.html',
  styleUrl: './profile-statements.component.css'
})
export class ProfileStatementsComponent implements OnInit , OnDestroy{

  open: boolean = false;
  statements: any= {};
  // startDate: string = '2000-10-25';
  // endDate: string = '2024-10-25';

   endDate:any
   startDate: any

  loading: boolean = false;
  private destroy$ = new Subject<void>();
   error: boolean = false;

  constructor(private storeService: StoreService, private router:Router, private authService: AuthService) {}

  //Open invoice detail
  openStatement(invoice:any) {
    this.router.navigate(['profile/statement-detail'], { state: { data: invoice }, queryParams: { invoiceNum: invoice.DocEntry } }); //
  }

  ngOnInit() {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    // Format the dates to 'yyyy-MM-dd' for the <input type="date"> fields
    this.startDate = oneMonthAgo.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    this.fetchStatements();
    // this.fetchIncomingPayments();
  }

  fetchStatements() {
    this.loading = true;
    console.log('Fetching statements from', this.startDate, 'to', this.endDate);
    this.storeService.getStoreStatements('local', `${this.endDate}T00:00:00.946Z`,
      `${this.startDate}T00:00:00.946Z`, this.authService.getAuthUser().customer?.cardCode)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error("Error fetching invoices:", error);
          this.loading = false;
          return of([]); // Fallback to empty array if there's an error
        })
      )
      .subscribe((response: any) => {
        this.statements = response;
        this.loading = false;

        console.log("STATEMENTS: ",this.statements)
      },
        (error:any) => {
          if(error.status === 404) {
            this.statements = this.statements =[];
            this.loading = false;
          }else {
            this.loading = false;
            this.error = true;
          }
        }
        );
  }


   formatDateString(dateStr: string): string {
    if (dateStr.length !== 8) {
      throw new Error("Invalid date format. Expected format: YYYYMMDD.");
    }

    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);

    return `${day}-${month}-${year}`;
  }





  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
