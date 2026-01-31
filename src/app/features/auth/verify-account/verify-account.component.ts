import { Component } from '@angular/core';

import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [
    RouterLink
],
  templateUrl: './verify-account.component.html',
  styleUrl: './verify-account.component.css'
})
export class VerifyAccountComponent {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(["/login"])
  }
}
