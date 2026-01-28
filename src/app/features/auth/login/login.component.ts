import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {AuthService} from "../../../core/services/auth/auth.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";
import {GoogleAnalyticsService} from "../../../core/services/google-analytics/google-analytics.service";
import {LocalService} from "../../../core/services/local/local.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  isLoading:boolean = false;
  errorMessage = '';
  showPassword: boolean = false;

  // Demo credentials for presentation when server is down
  private readonly DEMO_EMAIL = 'demo@example.com';
  private readonly DEMO_PASSWORD = 'qwertyuiop';

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private googleAnalyticsService: GoogleAnalyticsService,
    private localService: LocalService
  ) {
    this.isLoading = false;
    this.loginForm = this.fb.group({
      companyDB: [''],
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.loginForm.patchValue({companyDB:this.authService.getAuthUser().databaseName});
  }


  // Function to handle login submission
  onLogin() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    // Check for demo credentials (for presentation when server is down)
    if (username === this.DEMO_EMAIL && password === this.DEMO_PASSWORD) {
      this.handleDemoLogin();
      return;
    }

    const loginPayload = {
      companyDB: this.loginForm.value.companyDB,
      username: username,
      password: password
    };

    this.authService.login(loginPayload).subscribe({
      next: () => {
        this.isLoading = false;
        // Handle successful login, e.g., navigate to dashboard

        // Track login event
        this.googleAnalyticsService.trackEvent('login', {
          event_category: 'user',
          event_label: 'login_success',
          method: 'email'
        });

        //navigate to B2B dashboard
        this.router.navigateByUrl('/b2b/dashboard').then(()=>{
          window.location.reload();
        })
      },
      error: (error:any) => {
        // If server is down and demo credentials were used, fallback to demo login
        if (username === this.DEMO_EMAIL && password === this.DEMO_PASSWORD) {
          this.handleDemoLogin();
          return;
        }

        this.isLoading = false;
        this.errorMessage = 'Invalid login credentials. Please try again.';

        // Track login failure
        this.googleAnalyticsService.trackEvent('login', {
          event_category: 'user',
          event_label: 'login_failed',
          method: 'email'
        });
      }
    });
  }

  // Handle demo login for presentation purposes
  private handleDemoLogin() {
    // Create a mock JWT token that won't crash the isExpired function
    const expTime = Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000); // 24 hours from now
    const payload = { exp: expTime, sub: 'demo', iat: Math.floor(Date.now() / 1000) };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify(payload)) + '.demo-signature';

    // Create mock user session in the format expected by AuthService.getAuthUser()
    const demoSession = {
      userCode: 'DEMO001',
      userName: 'Demo Business User',
      userId: 1,
      employeeId: 1,
      jobTitle: 'Business Customer',
      salesPersonCode: 1,
      token: mockToken,
      tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      databaseName: 'DEMO_DB',
      warehouseCode: 'WH01',
      roles: ['Customer'],
      companyName: 'Demo Business Solutions Ltd',
      warehouseName: 'Main Warehouse',
      companySettings: {
        localCurrency: 'USD',
        systemCurrency: 'USD',
        isDirectRate: true
      },
      customer: {
        cardCode: 'C10001',
        cardName: 'Demo Business Solutions Ltd',
        currency: 'USD',
        warehouse: 'WH01',
        isVisitor: false,
        warehouseName: 'Main Warehouse'
      },
      email: this.DEMO_EMAIL,
      contactPerson: 'John Demo',
      phone: '+254 700 000 000',
      address: '123 Demo Street, Nairobi',
      isDemo: true
    };

    // Save demo session to local storage using 'auth' key (as expected by AuthService)
    this.localService.saveObject('auth', demoSession);
    this.localService.saveToken(mockToken);

    this.isLoading = false;

    // Track demo login event
    this.googleAnalyticsService.trackEvent('login', {
      event_category: 'user',
      event_label: 'demo_login_success',
      method: 'demo'
    });

    // Navigate to B2B dashboard using window.location for full page reload
    window.location.href = '/b2b/dashboard';
  }
}
