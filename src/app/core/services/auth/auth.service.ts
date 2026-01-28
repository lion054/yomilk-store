import {Injectable} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {LocalService} from "../local/local.service";
import {CurrencyService} from "../currency/currency.service";
import {catchError, of, tap, throwError} from "rxjs";
import {SessionService} from "../session/session.service";
import {Router} from "@angular/router";
import Swal from "sweetalert2";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authUrl = environment.authUrl;
  constructor(private http: HttpClient, private localService: LocalService, private currencyService:CurrencyService, private sessionService:SessionService, private router: Router) {
  }

  ///Register a new customer
  register(payload: any): any {
    return this.http.post(`${this.authUrl}ExternalUsers/Register`, payload);
  }

  ///Register a new customer with details
  registerCompleteCustomer(payload: any): any {
    return this.http.post(`${this.authUrl}StoreBusinessPartners/StoreCustomers/Register`, payload);
  }

  ///Verify Customer
  verifyRegistration(payload: any): any {
     const params = {
       email: payload.email,
       token: payload.token
     }

    return this.http.get(`${this.authUrl}ExternalUsers/Verify`, {params:params});
  }

  login(payload: any): any {
    return this.http.post(`${this.authUrl}Auths/Login/BusinessPartners`, payload).pipe(
      tap((response: any) => {
        // Update cache values
        this.localService.saveToken(response.token);
        this.localService.saveObject('auth',response);
        this.currencyService.setSelectedCurrency({
          "code": response.customer.currency,
          "name": "US Dollar",
          "acctCurrency": null
        })
      }),
      catchError((error: any) => {
        console.error("Error fetching store items:", error);
        // show error swal here
        Swal.fire({
          icon: 'error',
          title: 'Something went wrong',
          text: error.error.message,
          confirmButtonText: 'OK'
        });
        return throwError(error);
      })
    );
  }

  // verifyEmail(payload: any): any {
  //   return this.http.post(`${this.authUrl}auth/registrationConfirmation`, payload);
  // }

  signIn(payload: any): any {
    return this.http.post(`${this.authUrl}auth/restaurant/admin/login`, payload);
  }

  refreshAuth(payload: any): any {
    console.log("Get new token");
    //Todo change to my tenders
    return this.http.post(`${this.authUrl}auth/refresh`, payload);
  }

  // forgotPassword(cardCode:any = '', emailAddress:any): any {
  //   let payload = {
  //     emailAddress: emailAddress,
  //     cardCode: cardCode,
  //   }
  //
  //   return this.http.post(`${this.authUrl}StoreBusinessPartners/ResetPassword/GetOpt`,payload);
  // }

  forgotPassword(emailAddress:any): any {
    let payload = {
      emailAddress: emailAddress
    }
    return this.http.post(`${this.authUrl}ExternalUsers/ResetPassword/GetOtp`,payload);
  }

  // resetPassword(otp:any, newPassword:any, confirmPassword:any, cardCode:any): any {
  //   let payload =
  //   {
  //     otp: otp,
  //     newPassword: newPassword,
  //     confirmNewPassword: confirmPassword
  //   };
  //
  //   return this.http.post(`${this.authUrl}StoreBusinessPartners/${cardCode}/ResetPassword`, payload);
  // }


  resetPassword(otp:any, newPassword:any, confirmPassword:any, email:any): any {
    let payload =
      {
        email: email,
        otp: otp,
        newPassword: newPassword,
        confirmNewPassword: confirmPassword
      };

    return this.http.post(`${this.authUrl}ExternalUsers/ResetPassword`, payload);
  }

  changePassword(oldPassword:any, newPassword:any, confirmPassword:any, cardCode:any): any {
    let payload =
      {
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmPassword
      };

    return this.http.post(`${this.authUrl}StoreBusinessPartners/${cardCode}/ChangePassword`, payload);
  }




  ///Get Session token for Cash Customers
  getCashCustomerSession(){

    //Check is existing session is still Valid

    if(this.getAuthUser() == null || this.getAuthUser().customer?.isVisitor) {
      console.log("Getting CashCustomer Session")
      return this.http.get(`${this.authUrl}Auths/CashCustomer/Session`)
        .pipe(tap((response: any) => {
          if(response.token){
            ///save token if successful
            this.localService.saveToken(response.token);
            this.localService.saveObject('auth',response)
            this.currencyService.setSelectedCurrency({
              "code": response.customer.currency,
              "name": "US Dollar",
              "acctCurrency": null
            })
          }else {
            ///Handle missing token logic
          }
        }))
    }

    return of(null);




  }

  //gets the currently logged in users session details
  getAuthUser():UserSession{
    return this.localService.getObject('auth')?? null;
  }

  // Logout
  logOut() {
    this.localService.clearData()
    this.sessionService.resetSession()

    this.router.navigateByUrl('/store').then((response: any) => {
      window.location.reload();
    });

  }
}


export interface UserSession {
  userCode: string;
  userName: string;
  userId: number;
  employeeId: number;
  jobTitle: string;
  salesPersonCode: number;
  token: string;
  tokenExpiry: string;
  databaseName: string;
  warehouseCode: string;
  roles: string[];
  posRoles?: string | null;
  companyName: string;
  warehouseName?: string | null;
  companySettings?: {
    localCurrency: string;
    systemCurrency: string;
    isDirectRate: boolean;
  };
  customer?: {
    cardCode: string;
    cardName: string;
    currency: string;
    warehouse: string;
    isVisitor: boolean;
    warehouseName: string;
  };
}

