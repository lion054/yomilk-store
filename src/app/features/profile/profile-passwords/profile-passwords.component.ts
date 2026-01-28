import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../../core/services/auth/auth.service";
import {NgIf} from "@angular/common";
import Swal from "sweetalert2";

@Component({
  selector: 'app-profile-passwords',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './profile-passwords.component.html',
  styleUrl: './profile-passwords.component.css'
})
export class ProfilePasswordsComponent {
  changePasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
      { validators: this.passwordMatchValidator }
    );
  }

  // Custom Validator to check if newPassword and confirmPassword match
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsNotMatching: true };
  }

  // Method to submit the form and change the password
  changePassword() {
    if (this.changePasswordForm.valid){

      Swal.fire({
        title: "Do you want to change your password?",
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: "Change",
        denyButtonText: `Don't save`
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          this.isLoading = true;
          this.errorMessage = '';
          const { oldPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

          this.authService.changePassword(oldPassword, newPassword, confirmPassword, this.authService.getAuthUser().customer?.cardCode).subscribe({
            next: () => {
              this.isLoading = false;
              Swal.fire("Password changed successfully", "", "success");
            },
            error: (error: any) => {
              this.isLoading = false;
              // this.errorMessage = error.error.message || 'An error occurred while changing the password';
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.error.message || 'An error occurred while changing the password',
              })
            },
          });
        } else if (result.isDenied) {

        }
      });






    }else {
      Object.keys(this.changePasswordForm.controls).forEach(field => {
        const control = this.changePasswordForm.get(field);
        control!.markAsTouched({ onlySelf: true });
      });
    }


  }
}
