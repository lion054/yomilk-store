import { CanActivateFn } from '@angular/router';
import {LocalService} from "../services/local/local.service";
import {AuthService} from "../services/auth/auth.service";
import {inject} from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
  const  authService: AuthService = inject(AuthService)
  const isVisitor = authService.getAuthUser().customer?.isVisitor
  return !isVisitor;
  // return true;
};
