import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../../core/services/auth/auth.service";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";

import Swal from "sweetalert2";

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmNewPassword')?.value;
    return password === confirmPassword ? null : { passwordsNotMatching: true };
  };
}


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule
],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  emailForm: FormGroup;
  otpForm: FormGroup;
  isSubmitted = false; // Toggle between email and OTP view
  isLoading = false;
  errorMessage = '';
  showPassword: boolean = false;



  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      // cardCode: ['', [Validators.required]]
    });

    this.otpForm = this.fb.group({
      otp: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmNewPassword: ['', Validators.required]
    },{ validators: passwordMatchValidator() });
  }

  // Method to submit email and request OTP
  submitEmail() {
    if (this.emailForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const email = this.emailForm.value.email;


    this.authService.forgotPassword(this.emailForm.value.email)
      .subscribe({
        next: () => {

          // show Swal for checking email for otp
          Swal.fire({
            icon: 'info',
            title: 'Check your email',
            text: 'An OTP has been sent to your email address. Please check your inbox.',
          }).then(() => {
            this.isSubmitted = true;
            // Switch to OTP view
            this.isLoading = false;
          });

        },
        error: (error:any) => {
          this.isLoading = false;
          this.errorMessage = `${error.error.message}`;
          Swal.fire({
            icon: 'error',
            text: `${error.error.message}`,
          })
        }
      });
  }

  attempts = 3;
  // Method to verify OTP
  submitOTP() {
    if (this.otpForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const otp = this.otpForm.value.otp;


    this.authService.resetPassword(this.otpForm.value.otp, this.otpForm.value.newPassword, this.otpForm.value.confirmNewPassword, this.emailForm.value.email)
      .subscribe({
        next: (response:any) => {
          if(response){
            Swal.fire({
              icon: 'success',
              title: 'Password Reset Successful',
              text: 'Your password has been reset successfully.',
            }).then(() => {
              this.isSubmitted = false; // Switch back to email view
              this.emailForm.reset();
              this.otpForm.reset();
              this.router.navigateByUrl('/login');
            });
          }
          this.isLoading = false;
        },
        error: (error:any) => {
          this.attempts--;
          this.isLoading = false;
          if(this.attempts <= 0 || error.error.message === 'Too many attempts. Please try again in 20 minutes.'){
            this.isSubmitted=false;
            this.attempts = 3;
          }

          this.errorMessage = `${error.error.message}`;

          Swal.fire({
            icon: 'error',
            text: `${error.error.message}`,
          });
        }
      });
  }
}
