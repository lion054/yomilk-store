// session.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay, tap } from 'rxjs';
import {LocalService} from "../local/local.service";
import {CurrencyService} from "../currency/currency.service";
import {environment} from "../../../../environments/environment";

interface SessionResponse {
  token: string;
  customer: {
    isVisitor: boolean;
    currency: string;
  };
  // Add other required session properties
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private session$ = this.getCashCustomerSession().pipe(
    shareReplay(1) // Cache the session response
  );

  constructor(
    private http: HttpClient,
    private localService: LocalService,
    private currencyService: CurrencyService
  ) {}

  getSession(): Observable<unknown> {
    return this.session$;
  }

  resetSession() {
    this.session$ = this.getCashCustomerSession().pipe(shareReplay(1));
  }

  private getAuthUser(): any {
    return this.localService.getObject('auth');
  }

  private getCashCustomerSession(): Observable<unknown> {
    const authUser = this.getAuthUser();

    // Return existing valid session
    if (authUser && !authUser.customer?.isVisitor) {
      return of(null);
    }

    // Fetch new session
    return this.http.get<SessionResponse>(`${environment.authUrl}Auths/CashCustomer/Session`).pipe(
      tap((response) => {
        if (response.token) {
          this.localService.saveToken(response.token);
          this.localService.saveObject('auth', response);
          this.currencyService.setSelectedCurrency({
            code: response.customer.currency,
            name: 'US Dollar', // Consider making this dynamic
            acctCurrency: null
          });
        }
      })

    );
  }
}
