import { Routes } from '@angular/router';
import {StoreComponent} from "./features/store/store/store.component";
import {HomeComponent} from "./features/home/home.component";
import {ProfileComponent} from "./features/profile/profile.component";
import {RegisterComponent} from "./features/auth/register/register.component";
import {LoginComponent} from "./features/auth/login/login.component";
import {CheckoutComponent} from "./features/checkout/checkout.component";
import {ProductComponent} from "./features/product/product.component";
import {CartComponent} from "./features/cart/cart.component";
import {AboutUsComponent} from "./features/about-us/about-us.component";
import {ProfileDetailComponent} from "./features/profile/profile-detail/profile-detail.component";
import {ProfilePasswordsComponent} from "./features/profile/profile-passwords/profile-passwords.component";
import {ProfileInvoicesComponent} from "./features/profile/profile-invoices/profile-invoices.component";
import {
  ProfileInvoiceDetailComponent
} from "./features/profile/profile-invoice-detail/profile-invoice-detail.component";
import {ContactUsComponent} from "./features/contact-us/contact-us.component";
import {ProfileStatementsComponent} from "./features/profile/profile-statements/profile-statements.component";
import {
  ProfileStatementDetailComponent
} from "./features/profile/profile-statement-detail/profile-statement-detail.component";
import {
  ProfileWalletIncomingPaymentsComponent
} from "./features/profile/profile-wallet-incoming-payments/profile-wallet-incoming-payments.component";
import {
  ProfileFundWalletComponent
} from "./features/profile/profile-wallet-incoming-payments/profile-fund-wallet/profile-fund-wallet.component";
import {ForgotPasswordComponent} from "./features/auth/forgot-password/forgot-password.component";
import {authGuard} from "./core/guards/auth.guard";
import {PageNotFoundComponent} from "./features/page-not-found/page-not-found.component";
import {PayInvoiceComponent} from "./features/profile/profile-invoices/pay-invoice/pay-invoice.component";
import {resolve} from "@angular/compiler-cli";
import {sessionResolver} from "./core/resolvers/session.resolver";
import {RegisterVerifyComponent} from "./features/auth/register-verify/register-verify.component";
import {CheckOrderComponent} from "./features/check-order/check-order.component";
import {RegisterLongComponent} from "./features/auth/register-long/register-long.component";
import {FaqComponent} from "./features/faq/faq.component";
import {VerifyAccountComponent} from "./features/auth/verify-account/verify-account.component";
import {VendorsComponent} from "./features/vendors/vendors.component";
import {VendorOnboardingComponent} from "./features/vendor-onboarding/vendor-onboarding.component";
import {ServicesComponent} from "./features/services/services.component";
import {WishlistComponent} from "./features/wishlist/wishlist.component";
import {LeafletsComponent} from "./features/leaflets/leaflets.component";

// B2B Portal Components
import {B2bLayoutComponent} from "./features/b2b/b2b-layout.component";
import {B2bDashboardComponent} from "./features/b2b/dashboard/b2b-dashboard.component";
import {B2bSchedulesComponent} from "./features/b2b/schedules/b2b-schedules.component";
import {B2bOrdersComponent} from "./features/b2b/orders/b2b-orders.component";
import {B2bOrderDetailComponent} from "./features/b2b/orders/b2b-order-detail.component";
import {B2bNewOrderComponent} from "./features/b2b/new-order/b2b-new-order.component";
import {B2bSettingsComponent} from "./features/b2b/settings/b2b-settings.component";
import {B2bAccountComponent} from "./features/b2b/account/b2b-account.component";

export const routes: Routes = [
  // {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: '', component: HomeComponent}, // Default route to home with session resolver
  {path: 'store', component: StoreComponent},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  //Todo Enable this for home when API is ready
  // resolve: {session: sessionResolver}
  {path: 'register', component: RegisterComponent},
  {path: 'register-complete', component: RegisterLongComponent},
  {path: 'register/verify', component: RegisterVerifyComponent},
  {path: 'verify-account', component: VerifyAccountComponent},
  {path: 'profile', component: ProfileComponent,canActivate:[authGuard], children: [
      {path: '', redirectTo:'/profile/detail', pathMatch:"full"},
      {path: 'detail', component: ProfileDetailComponent},
      {path: 'invoice', component: ProfileInvoicesComponent},
      {path: 'statements', component: ProfileStatementsComponent},
      {path: 'payments', component: ProfileWalletIncomingPaymentsComponent},
      {path: 'wallet/fund', component: ProfileFundWalletComponent},
      {path: 'statement-detail', component: ProfileStatementDetailComponent},
      {path: 'invoice-detail', component: ProfileInvoiceDetailComponent},
      {path: 'security', component: ProfilePasswordsComponent},
      {path: 'pay-invoice', component: PayInvoiceComponent}
    ]},
  {path: 'checkout', component: CheckoutComponent},
  {path: 'product/:itemCode', component: ProductComponent},
  {path: 'cart', component: CartComponent},
  {path: 'check-order', component: CheckOrderComponent},
  {path: 'about-us', component: AboutUsComponent},
  {path: 'contact-us', component: ContactUsComponent},
  {path: 'faq', component: FaqComponent},
  {path: 'vendors', component: VendorsComponent},
  {path: 'become-a-vendor', component: VendorOnboardingComponent},
  {path: 'services', component: ServicesComponent},
  {path: 'wishlist', component: WishlistComponent},
  {path: 'leaflets', component: LeafletsComponent},

  // B2B Portal Routes
  {path: 'b2b', component: B2bLayoutComponent, canActivate: [authGuard], children: [
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    {path: 'dashboard', component: B2bDashboardComponent},
    {path: 'schedules', component: B2bSchedulesComponent},
    {path: 'orders', component: B2bOrdersComponent},
    {path: 'orders/:id', component: B2bOrderDetailComponent},
    {path: 'new-order', component: B2bNewOrderComponent},
    {path: 'account', component: B2bAccountComponent},
    {path: 'settings', component: B2bSettingsComponent}
  ]},

  { path: '**', component: PageNotFoundComponent },

];
