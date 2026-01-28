import {inject} from '@angular/core';
import {
  HttpRequest,
  HttpEvent,
  HttpHandlerFn
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {LocalService} from "../services/local/local.service";
import {isJwtAboutToExpire} from "../functions/helpers";
import {Router} from "@angular/router";


export function AuthInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  let token;
  const router = inject(Router);
  const localService = inject(LocalService);

  token = localService.getToken()!;

  // Ignore requests to PayNow CheckPayment URL
  if (request.url.includes("https://www.paynow.co.zw/Interface/CheckPayment/")) {
    console.log("Skipping AuthInterceptor for PayNow CheckPayment request");
    let finalRequest = request.clone({headers: request.headers
        .set('Access-Control-Allow-Origin','*')
        .set('Accept', 'text/html, application/xhtml+xml, */*')
        .set('Content-Type', 'application/json')
    });
    console.log("Request  Url ", finalRequest.url);
    return next(finalRequest);
  }else {
    if(token){
      // /Check if token is about to expire
      if(isJwtAboutToExpire(token)){
        console.log('This jwt will expire soon');
        localService.clearData();
        router.navigateByUrl('/login');
        console.log("Auth Expired");
        return new Observable<HttpEvent<unknown>>();
      }


      if(request.url.includes("auth")){
        console.log("Auth NO NEED FOR TOKEN INJECTION");
        return next(request);
      }

      // console.log("Injecting Token: ", token);
      let tokenizedReq = request.clone({headers: request.headers
          .set('Authorization','Bearer '+token)
          .set('Access-Control-Allow-Origin','*')
          .set('Accept', 'text/html, application/xhtml+xml, */*')
          .set('Content-Type', 'application/json')
      });
      return next(tokenizedReq);
    }
    let finalRequest = request.clone({headers: request.headers
        .set('Access-Control-Allow-Origin','*')
        .set('Accept', 'text/html, application/xhtml+xml, */*')
        .set('Content-Type', 'application/json')
    });
    console.log("NO TOKEN TO INJECTED");
    console.log("Request  Url ", finalRequest.url);
    return next(finalRequest);
  }


}
