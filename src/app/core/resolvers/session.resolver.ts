import { ResolveFn } from '@angular/router';
import {inject} from "@angular/core";
import {LocalService} from "../services/local/local.service";
import {isJwtAboutToExpire} from "../functions/helpers";
import {AuthService} from "../services/auth/auth.service";
import {of, switchMap} from "rxjs";

export const sessionResolver: ResolveFn<boolean> = (route, state) => {
  // Ensure session is available and valid, else retrieve a new session
  const localService = inject(LocalService);
  const authService = inject(AuthService);

  let token = localService.getToken();
  if (token && !isJwtAboutToExpire(token)) {
    // Session is valid; no need for a new session
    return of(true);
  }

  // If token is about to expire or not present, clear data and fetch a new session
  localService.clearData();

  return authService.getCashCustomerSession().pipe(
    switchMap((result) => {
      // Process session data if needed

      return of(true);  // Resolver completes successfully
    })
  );
};
