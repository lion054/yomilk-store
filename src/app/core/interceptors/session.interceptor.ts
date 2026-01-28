import {SessionService} from "../services/session/session.service";
import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, take } from 'rxjs';

export const sessionInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionService = inject(SessionService);

  if (req.url.includes('Auths/CashCustomer/Session')) {
    return next(req);
  }

  if (req.url.includes("https://www.paynow.co.zw/Interface/CheckPayment/")) {
    console.log("Skipping AuthInterceptor for PayNow CheckPayment request");
    return next(req);
  }

  return sessionService.getSession().pipe(
    take(1),
    switchMap((session:any) => {
      // Add auth header only if session exists
      const modifiedReq = session?.token ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${session.token}`
        }
      }) : req;

      return next(modifiedReq);
    })
  );
};
