import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {AuthService} from "../../core/services/auth/auth.service";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{

  constructor(private router: Router, private authService: AuthService) {}

  logOut() {
    this.authService.logOut();
  }

  ngOnInit() {
    window.scrollTo(0, 0);
  }
}
