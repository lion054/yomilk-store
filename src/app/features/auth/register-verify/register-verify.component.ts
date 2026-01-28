import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {NgIf} from "@angular/common";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../core/services/auth/auth.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-register-verify',
  standalone: true,
  imports: [
    RouterLink,
    NgIf
  ],
  templateUrl: './register-verify.component.html',
  styleUrl: './register-verify.component.css'
})
export class RegisterVerifyComponent implements OnInit {

  //Test Url String
  // https://snappyfresh.net/register/verify?token=2ZObs5oqVkCK17xxSafAdg==Yg7FndPaxkmCvceqi2G1aA==&email=nyashaasheckhove@gmail.com

  // http://localhost:4200/register/verify?token=2ZObs5oqVkCK17xxSafAdg==Yg7FndPaxkmCvceqi2G1aA==&email=nyashaasheckhove@gmail.com

  isLoading:boolean = true;
  isSuccess:boolean = false;
  isError:boolean = false;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params:any) => {
      this.verifyEmail(params['email'], params['token']);
    });
  }

  verifyEmail(email: string, token:string){
    this.isLoading = true;
    const payload = {
      email: email,
      token: token
    }

    this.authService.verifyRegistration(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;

        setTimeout(() => {
          this.router.navigateByUrl('/login').then(()=>{})
        }, 5000);

        //Navigate to home screen
      },
      error: (error:any) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.isError = true;
        console.error('Verification failed', error);
        Swal.fire({
          icon: 'error',
          title: 'Account could not be verified',
          text: 'Please try again later or contact support if the issue persists.'
        });

      }
    })

  }

}
