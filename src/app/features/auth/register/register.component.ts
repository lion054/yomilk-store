import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {AuthService} from "../../../core/services/auth/auth.service";
import Swal from "sweetalert2";
import {environment} from "../../../../environments/environment";

import {GoogleAnalyticsService} from "../../../core/services/google-analytics/google-analytics.service";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule
],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{

  registerForm: FormGroup;
  isLoading:boolean = false;
  errorMessage = '';
  showPassword: boolean = false;

  constructor(private router: Router, private authService: AuthService , private fb: FormBuilder, private googleAnalyticsService: GoogleAnalyticsService) {
    this.isLoading = false;
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        this.passwordValidator
      ]],
      confirmPassword: ['', Validators.required]
    },
      {
        validator: this.matchPasswordsValidator
      }
      );
  }

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  // Add this custom validator function inside your component class
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const errors: ValidationErrors = {};

    if (!value) return null;

    if (value.length < 8) {
      errors['minlength'] = { requiredLength: 8 };
    }
    if (!/[A-Z]/.test(value)) {
      errors['missingUppercase'] = true;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors['missingSpecialChar'] = true;
    }
    if (!/\d/.test(value)) {
      errors['missingNumber'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // Add this password matching validator
  private matchPasswordsValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }



  // Function to handle login submission
  onRegister() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const loginPayload = {
      "email": this.registerForm.value.email,
      "password": this.registerForm.value.password,
      "verificationUrl": `${environment.siteUrl}register/verify`
    }

    this.authService.register(loginPayload).subscribe({
      next: () => {
        this.isLoading = false;

        // Track successful registration
        this.googleAnalyticsService.trackEvent('sign_up', {
          event_category: 'user',
          event_label: 'registration_success',
          method: 'email'
        });

        ///Navigate to register page
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'Your account was created successfully, check your email for a verification link',
        }).then(() => {
          this.router.navigateByUrl('/verify-account');
        });


        //navigate to store
        // this.router.navigateByUrl('/register/verify').then(()=>{
        // })
      },
      error: (error:any) => {
        this.isLoading = false;
        // this.errorMessage = 'Could not register account. Please try again.';
        this.errorMessage = `${error.error.message}`;

        // Track registration failure
        this.googleAnalyticsService.trackEvent('sign_up', {
          event_category: 'user',
          event_label: 'registration_failed',
          method: 'email'
        });

        Swal.fire({
          icon: 'error',
          title: 'Something went wrong',
          text: this.errorMessage,
        })
      }
    });
  }

}
