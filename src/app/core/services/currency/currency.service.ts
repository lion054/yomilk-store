import {Injectable, signal} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, of, Subscription, tap} from "rxjs";
import {AuthService} from "../auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  apiUrl = environment.apiURL;
  private selectedCurrencySubject = new BehaviorSubject<any>({
    "code": environment.currency,
    "name": "US Dollar",
    "acctCurrency": null
  },);

  selectedCurrency$ = this.selectedCurrencySubject.asObservable();
  public currencies = [];


  constructor(private http: HttpClient) { }

  ///Get list of currencies
  getCurrencies():any{
    return this.http.get(`${this.apiUrl}Currencies/ChooseLists`)
      .pipe(
      tap((response: any) => {

      },
        (err: any) => {

          if (err.error === 'server error @Invalid session or session already timeout. (401)'){
            localStorage.clear()
            window.location.reload();
          }
        }
        )
    );

    // Simulated result
    // return  of([
    //     {
    //       "code": "AUD",
    //       "name": "Australian Dollar",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "ETB",
    //       "name": "Birr",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "GBP",
    //       "name": "British Pound",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "GHS",
    //       "name": "Cedi",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "EUR",
    //       "name": "Euro",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "RWF",
    //       "name": "Franc",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "JPY",
    //       "name": "Japanese Yen",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "MWK",
    //       "name": "Kwacha",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "ZMW",
    //       "name": "Kwacha",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "MZN",
    //       "name": "Metical",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "NGN",
    //       "name": "Naira",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "NZD",
    //       "name": "New Zealand Dollar",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "BWP",
    //       "name": "Pula",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "ZAR",
    //       "name": "Rand",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "MUR",
    //       "name": "Rupee",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "KES",
    //       "name": "Shilling",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "TZS",
    //       "name": "Shilling",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "SGD",
    //       "name": "Singapore Dollar",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "USD",
    //       "name": "US Dollar",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "ZIG",
    //       "name": "Zimbabwe Gold",
    //       "acctCurrency": null
    //     },
    //     {
    //       "code": "ZWL",
    //       "name": "Zimbabwean RTGS",
    //       "acctCurrency": null
    //     }
    //   ]
    // )


  }

  //Sets currency
  // Update the selected currency and notify all listeners
  setSelectedCurrency(currency: any): void {
    this.selectedCurrencySubject.next(currency);
  }


}
