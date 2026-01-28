import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../../core/services/auth/auth.service";
import {environment} from "../../../../environments/environment";
import Swal from "sweetalert2";
import {City, Country, Suburb} from "../../../core/interfaces/interfaces";
import {GeolocationService} from "../../../core/services/location/geolocation.service";
import {NgSelectModule} from "@ng-select/ng-select";
import {CountryISO, NgxIntlTelInputModule, SearchCountryField} from "ngx-intl-tel-input";

@Component({
  selector: 'app-register-long',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    NgForOf,
    NgSelectModule,
    NgxIntlTelInputModule
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './register-long.component.html',
  styleUrl: './register-long.component.css'
})
export class RegisterLongComponent implements OnInit{
  registerForm: FormGroup;
  isLoading:boolean = false;
  errorMessage = '';
  countries: Country[] = [];

  // Filtered lists for dropdowns
  billCities: City[] = [];
  billSuburbs: Suburb[] = [];
  shipCities: City[] = [];
  shipSuburbs: Suburb[] = [];
  showPassword: boolean = false;

  updateBillCities(countryCode: string): void {
    const country = this.countries.find(c => c.countryCode === countryCode);
    this.billCities = country ? country.cities : [];
    this.registerForm.get('billToAddress.city')?.setValue('');
    this.billSuburbs = [];
  }

  updateBillSuburbs(cityName: string): void {
    const country = this.countries.find(c => c.countryCode === this.registerForm.get('billToAddress.countryCode')?.value);
    if (country) {
      const city = country.cities.find(c => c.name === cityName);
      this.billSuburbs = city ? city.suburbs : [];
      this.registerForm.get('billToAddress.suburb')?.setValue('');
      this.billSuburbs.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
    }
  }

  updateShipCities(countryCode: string): void {
    const country = this.countries.find(c => c.countryCode === countryCode);
    this.shipCities = country ? country.cities : [];
    this.registerForm.get('shipToAddress.city')?.setValue('');
    this.shipSuburbs = [];
  }

  updateShipSuburbs(cityName: string): void {
    const country = this.countries.find(c => c.countryCode === this.registerForm.get('shipToAddress.countryCode')?.value);
    if (country) {
      const city = country.cities.find(c => c.name === cityName);
      this.shipSuburbs = city ? city.suburbs : [];
      this.registerForm.get('shipToAddress.suburb')?.setValue('');
      this.shipSuburbs.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
    }
  }

  constructor(private router: Router, private authService: AuthService , private fb: FormBuilder, private deliveryZonesService: GeolocationService) {
    this.isLoading = false;
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      companyName: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      whatsAppNumber: [''],
      isCompany: [false, Validators.required],
      tin: [''],
      vatNumber: [''],
      password: ['', [Validators.required, this.passwordValidator]],
      confirmPassword: ['', Validators.required],
      verificationUrl: [''],
      isSeparateShipping: [false], // New boolean field
      billToAddress: this.fb.group({
        addressLine1: ['', Validators.required],
        suburb: ['', Validators.required],
        city: ['', Validators.required],
        countryCode: [''],
        countryName: ['']
      }),
      shipToAddress: this.fb.group({
        addressLine1: [''],
        suburb: [''],
        city: [''],
        countryCode: [''],
        countryName: ['']
      }),
      notes: ['']
    }, {
      validator: this.matchPasswordsValidator
    });

  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.deliveryZonesService.getDeliveryZonesNoGeolocations().subscribe({
      next: (response:any) => {
        this.countries = response;
        // Set up validators for shipping address when checkbox is toggled
        this.registerForm.get('billToAddress.countryCode')?.valueChanges.subscribe((countryCode: string) => {
          this.updateBillCities(countryCode);
        });

        this.registerForm.get('billToAddress.city')?.valueChanges.subscribe((cityName:string) => {
          this.updateBillSuburbs(cityName);
        });

        this.registerForm.get('shipToAddress.countryCode')?.valueChanges.subscribe((countryCode:string) => {
          this.updateShipCities(countryCode);
        });

        this.registerForm.get('shipToAddress.city')?.valueChanges.subscribe((cityName:string) => {
          this.updateShipSuburbs(cityName);
        });

        this.registerForm.patchValue({
          billToAddress: {
            countryCode: this.countries[0].countryCode,
            city: this.countries[0].cities[0].name
          },
          shipToAddress: {
            countryCode: this.countries[0].countryCode,
            city: this.countries[0].cities[0].name
          }
        })
      },
      error: error => {

      }
    })

  }

  // Set Validators on Shipping fields if seperate
  onSeparateShippingChange(): void {
    if (this.registerForm.value.isSeparateShipping) {
      this.registerForm.get('shipToAddress.addressLine1')?.setValidators(Validators.required);
      this.registerForm.get('shipToAddress.countryCode')?.setValidators(Validators.required);
      this.registerForm.get('shipToAddress.city')?.setValidators(Validators.required);
      this.registerForm.get('shipToAddress.suburb')?.setValidators(Validators.required);
    } else {
      this.registerForm.get('shipToAddress.addressLine1')?.clearValidators();
      this.registerForm.get('shipToAddress.countryCode')?.clearValidators();
      this.registerForm.get('shipToAddress.city')?.clearValidators();
      this.registerForm.get('shipToAddress.suburb')?.clearValidators();
    }

    this.registerForm.get('shipToAddress.addressLine1')?.updateValueAndValidity();
    this.registerForm.get('shipToAddress.countryCode')?.updateValueAndValidity();
    this.registerForm.get('shipToAddress.city')?.updateValueAndValidity();
    this.registerForm.get('shipToAddress.suburb')?.updateValueAndValidity();
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
    ///Set country name
    let selectedCountry: Country | any = this.countries.find((country:Country) => country.countryCode === this.registerForm.value.billToAddress.countryCode);

    this.registerForm.patchValue({
      billToAddress: {
        countryName: selectedCountry.countryName,
      }
    })

    if(!this.registerForm.value.isSeparateShipping){
      // make the shipping info same as billing
      this.registerForm.value.shipToAddress = this.registerForm.value.billToAddress
    }else {
      let selectedShippingCountry: Country | any = this.countries.find((country:Country) => country.countryCode === this.registerForm.value.shipToAddress.countryCode);

      this.registerForm.patchValue({
        shipToAddress: {
          countryName: selectedShippingCountry.countryName,
        }
      })
    }

    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    let registerPayload:any = this.registerForm.value;

    registerPayload.phoneNumber = this.registerForm.value.phoneNumber.e164Number;

    if(this.registerForm.value.whatsAppNumber){
      registerPayload.whatsAppNumber = this.registerForm.value.whatsAppNumber.e164Number;
    }

    registerPayload['verificationUrl'] = `${environment.siteUrl}register/verify`

    // console.log(registerPayload);

    this.authService.registerCompleteCustomer(registerPayload).subscribe({
      next: (response:any) => {
        this.isLoading = false;
        ///Navigate to register page
        // {"accountCreated":true,"customerCreated":true,"message":""}
        if(response.accountCreated){
          Swal.fire({
            icon: 'success',
            title: 'Registration Successful',
            text: 'Your account was created successfully, check your email for a verification link',
          }).then(() =>{
            this.router.navigateByUrl('/verify-account');
          })
        }

        //navigate to store
        // this.router.navigateByUrl('/register/verify').then(()=>{
        // })
      },
      error: (error:any) => {

        Swal.fire({
          icon: 'error',
          title: 'Something went wrong',
          text: `${error.error.message}`,
        })

        this.isLoading = false;
        // this.errorMessage = 'Could not register account. Please try again.';
        this.errorMessage = `${error.error.message}`;
      }
    });
  }

  protected readonly CountryISO = CountryISO;
  protected readonly SearchCountryField = SearchCountryField;
}
