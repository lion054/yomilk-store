import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, UserSession } from '../../../core/services/auth/auth.service';
import { StoreService } from '../../../core/services/store/store.service';
import { InvoicePdfService, InvoiceData } from '../../../core/services/pdf/invoice-pdf.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-b2b-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Account</h1>
          <p class="text-gray-500">View your statements, invoices, and payments</p>
        </div>
        @if (!isLoading && !errorMessage) {
          <button
            (click)="refreshData()"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
            <i class="fas fa-sync-alt"></i>
            Refresh
          </button>
        }
      </div>
    
      <!-- Error State -->
      @if (errorMessage) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Unable to Load Account Data</h3>
          <p class="text-red-600 mb-4">{{ errorMessage }}</p>
          <button
            (click)="refreshData()"
            class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
            <i class="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      }
    
      <!-- Account Summary Cards -->
      @if (!errorMessage) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl p-5 border border-gray-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-wallet text-green-600 text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Account Balance</p>
                <p class="text-2xl font-bold text-green-600">{{ accountBalance | currency:'USD':'symbol':'1.2-2' }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-5 border border-gray-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Outstanding</p>
                <p class="text-2xl font-bold text-red-600">{{ outstandingBalance | currency:'USD':'symbol':'1.2-2' }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-5 border border-gray-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-file-invoice text-purple-600 text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-sm">Open Invoices</p>
                <p class="text-2xl font-bold text-gray-900">{{ openInvoicesCount }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-5 border border-gray-200">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-credit-card text-blue-600 text-xl"></i>
              </div>
              <div>
                <p class="text-gray-500 text-sm">This Month's Payments</p>
                <p class="text-2xl font-bold text-gray-900">{{ thisMonthPayments | currency:'USD':'symbol':'1.0-0' }}</p>
              </div>
            </div>
          </div>
        </div>
      }
    
      <!-- Tabs -->
      @if (!errorMessage) {
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px overflow-x-auto">
              @for (tab of tabs; track tab) {
                <button
                  (click)="activeTab = tab.id"
                  class="px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors"
              [ngClass]="{
                'border-[#42af57] text-[#42af57]': activeTab === tab.id,
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== tab.id
              }"
                  >
                  <i [class]="tab.icon + ' mr-2'"></i>
                  {{ tab.label }}
                  @if (tab.count > 0) {
                    <span
                      class="ml-2 px-2 py-0.5 text-xs rounded-full"
                [ngClass]="{
                  'bg-[#42af57]/10 text-[#42af57]': activeTab === tab.id,
                  'bg-gray-100 text-gray-600': activeTab !== tab.id
                }"
                      >
                      {{ tab.count }}
                    </span>
                  }
                </button>
              }
            </nav>
          </div>
          <div class="p-6">
            <!-- Loading State -->
            @if (isLoading) {
              <div class="py-12 text-center">
                <div class="w-12 h-12 border-4 border-[#42af57] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gray-500">Loading data...</p>
              </div>
            }
            <!-- Statements Tab -->
            @if (activeTab === 'statements' && !isLoading) {
              <div>
                <div class="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div class="text-center">
                      <p class="text-sm text-gray-500 mb-1">Total Invoiced</p>
                      <p class="text-2xl font-bold text-gray-900">{{ totalInvoiced | currency:'USD':'symbol':'1.2-2' }}</p>
                    </div>
                    <div class="text-center">
                      <p class="text-sm text-gray-500 mb-1">Total Paid</p>
                      <p class="text-2xl font-bold text-green-600">{{ totalPaid | currency:'USD':'symbol':'1.2-2' }}</p>
                    </div>
                    <div class="text-center">
                      <p class="text-sm text-gray-500 mb-1">Balance Due</p>
                      <p class="text-2xl font-bold" [ngClass]="balanceDue > 0 ? 'text-red-600' : 'text-green-600'">
                        {{ balanceDue | currency:'USD':'symbol':'1.2-2' }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr class="border-b border-gray-200">
                        <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
                        <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900">Description</th>
                        <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900">Reference</th>
                        <th class="text-right py-3 px-4 text-sm font-semibold text-gray-900">Debit</th>
                        <th class="text-right py-3 px-4 text-sm font-semibold text-gray-900">Credit</th>
                        <th class="text-right py-3 px-4 text-sm font-semibold text-gray-900">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of statementItems; track item) {
                        <tr class="border-b border-gray-100 hover:bg-gray-50">
                          <td class="py-3 px-4 text-sm text-gray-900">{{ item.RefDate | date:'MMM d, yyyy' }}</td>
                          <td class="py-3 px-4 text-sm text-gray-900">{{ item.TransType || item.Memo }}</td>
                          <td class="py-3 px-4 text-sm text-gray-500">{{ item.Ref1 || item.Ref2 || '-' }}</td>
                          <td class="py-3 px-4 text-sm text-right text-gray-900">
                            {{ item.Debit > 0 ? (item.Debit | currency:'USD':'symbol':'1.2-2') : '-' }}
                          </td>
                          <td class="py-3 px-4 text-sm text-right text-green-600">
                            {{ item.Credit > 0 ? (item.Credit | currency:'USD':'symbol':'1.2-2') : '-' }}
                          </td>
                          <td class="py-3 px-4 text-sm text-right font-medium" [ngClass]="item.BalanceDue > 0 ? 'text-red-600' : 'text-green-600'">
                            {{ item.BalanceDue | currency:'USD':'symbol':'1.2-2' }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
                @if (statementItems.length === 0) {
                  <div class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i class="fas fa-file-alt text-gray-400 text-2xl"></i>
                    </div>
                    <p class="text-gray-500">No statement entries found</p>
                  </div>
                }
              </div>
            }
            <!-- Invoices Tab -->
            @if (activeTab === 'invoices' && !isLoading) {
              <div>
                <div class="mb-4 flex flex-wrap items-center gap-3">
                  @for (filter of invoiceFilters; track filter) {
                    <button
                      (click)="invoiceFilter = filter.id"
                      class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                [ngClass]="{
                  'bg-[#42af57] text-white': invoiceFilter === filter.id,
                  'bg-gray-100 text-gray-700 hover:bg-gray-200': invoiceFilter !== filter.id
                }"
                      >
                      {{ filter.label }}
                      <span class="ml-1 text-xs opacity-75">({{ filter.count }})</span>
                    </button>
                  }
                </div>
                <div class="space-y-4">
                  @for (invoice of filteredInvoices; track invoice) {
                    <div
                      class="border border-gray-200 rounded-xl p-5 hover:border-[#42af57] hover:shadow-sm transition-all"
                      >
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div class="flex items-start gap-4">
                          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            [ngClass]="getInvoiceStatusBgClass(invoice)">
                            <i class="fas fa-file-invoice text-lg"
                            [ngClass]="getInvoiceStatusTextClass(invoice)"></i>
                          </div>
                          <div>
                            <div class="flex items-center gap-2 mb-1">
                              <span class="font-semibold text-gray-900">{{ invoice.DocNum }}</span>
                              <span
                                class="text-xs px-2 py-0.5 rounded-full"
                                [ngClass]="getInvoiceStatusBadgeClass(invoice)"
                                >
                                {{ getInvoiceStatus(invoice) }}
                              </span>
                            </div>
                            <p class="text-sm text-gray-500">
                              <i class="fas fa-calendar mr-1"></i>
                              Due: {{ invoice.DocDueDate | date:'MMM d, yyyy' }}
                            </p>
                            <p class="text-sm text-gray-500 mt-1">{{ invoice.Comments || 'Invoice' }}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-4">
                          <div class="text-right">
                            <p class="text-lg font-bold" [ngClass]="isOverdue(invoice) ? 'text-red-600' : 'text-gray-900'">
                              {{ invoice.DocCur || 'USD' }} {{ invoice.DocTotal | number:'1.2-2' }}
                            </p>
                            @if (invoice.PaidToDate > 0) {
                              <p class="text-sm text-green-600">
                                Paid: {{ invoice.DocCur || 'USD' }} {{ invoice.PaidToDate | number:'1.2-2' }}
                              </p>
                            }
                          </div>
                          @if (!isPaid(invoice)) {
                            <button
                              class="px-4 py-2 bg-[#42af57] text-white text-sm font-medium rounded-lg hover:bg-[#3a9b4d] transition-colors"
                              >
                              Pay Now
                            </button>
                          }
                          <button
                            (click)="downloadInvoicePdf(invoice)"
                            class="p-2 text-gray-400 hover:text-[#42af57] transition-colors"
                            title="Download Invoice PDF"
                            >
                            <i class="fas fa-download"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                  @if (filteredInvoices.length === 0) {
                    <div class="text-center py-12">
                      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-file-invoice text-gray-400 text-2xl"></i>
                      </div>
                      <p class="text-gray-500">No invoices found</p>
                    </div>
                  }
                </div>
              </div>
            }
            <!-- Payments Tab -->
            @if (activeTab === 'payments' && !isLoading) {
              <div>
                <div class="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 text-center">
                    <p class="text-sm text-gray-500 mb-1">This Month</p>
                    <p class="text-2xl font-bold text-teal-600">{{ thisMonthPayments | currency:'USD':'symbol':'1.2-2' }}</p>
                  </div>
                  <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 text-center">
                    <p class="text-sm text-gray-500 mb-1">Last Month</p>
                    <p class="text-2xl font-bold text-blue-600">{{ lastMonthPayments | currency:'USD':'symbol':'1.2-2' }}</p>
                  </div>
                  <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 text-center">
                    <p class="text-sm text-gray-500 mb-1">Total This Year</p>
                    <p class="text-2xl font-bold text-purple-600">{{ yearToDatePayments | currency:'USD':'symbol':'1.2-2' }}</p>
                  </div>
                </div>
                <div class="space-y-4">
                  @for (payment of payments; track payment) {
                    <div
                      class="border border-gray-200 rounded-xl p-5 hover:border-teal-300 hover:shadow-sm transition-all"
                      >
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div class="flex items-start gap-4">
                          <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-credit-card text-teal-600 text-lg"></i>
                          </div>
                          <div>
                            <div class="flex items-center gap-2 mb-1">
                              <span class="font-semibold text-gray-900">{{ payment.DocNum || 'PAY-' + payment.DocEntry }}</span>
                              <span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                Completed
                              </span>
                            </div>
                            <p class="text-sm text-gray-500">
                              <i class="fas fa-calendar mr-1"></i>
                              {{ payment.DocDate | date:'MMM d, yyyy' }}
                            </p>
                            <p class="text-sm text-gray-500 mt-1">
                              <i class="fas fa-credit-card mr-1"></i>
                              {{ payment.U_ONA_POSPaymentMethod || payment.PaymentMethod || 'Payment' }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-center gap-4">
                          <div class="text-right">
                            <p class="text-lg font-bold text-green-600">
                              +{{ payment.DocCurrency || 'USD' }} {{ getPaymentAmount(payment) | number:'1.2-2' }}
                            </p>
                            @if (payment.Remarks || payment.TransferReference) {
                              <p class="text-sm text-gray-500">
                                {{ payment.Remarks || ('Ref: ' + payment.TransferReference) }}
                              </p>
                            }
                          </div>
                          <button class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <i class="fas fa-download"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                  @if (payments.length === 0) {
                    <div class="text-center py-12">
                      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-credit-card text-gray-400 text-2xl"></i>
                      </div>
                      <p class="text-gray-500">No payments found</p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
    `
})
export class B2bAccountComponent implements OnInit {
  activeTab = 'statements';
  invoiceFilter = 'all';
  isLoading = true;

  // Summary data
  accountBalance = 0;
  outstandingBalance = 0;
  openInvoicesCount = 0;
  thisMonthPayments = 0;
  lastMonthPayments = 0;
  yearToDatePayments = 0;

  // Statement data
  totalInvoiced = 0;
  totalPaid = 0;
  balanceDue = 0;

  tabs = [
    { id: 'statements', label: 'Statements', icon: 'fas fa-file-alt', count: 0 },
    { id: 'invoices', label: 'Invoices', icon: 'fas fa-file-invoice', count: 0 },
    { id: 'payments', label: 'Payments', icon: 'fas fa-credit-card', count: 0 }
  ];

  invoiceFilters = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'overdue', label: 'Overdue', count: 0 },
    { id: 'pending', label: 'Pending', count: 0 },
    { id: 'paid', label: 'Paid', count: 0 }
  ];

  statementItems: any[] = [];
  invoices: any[] = [];
  payments: any[] = [];

  private cardCode = '';
  private user: UserSession | null = null;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private invoicePdfService: InvoicePdfService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getAuthUser();
    this.cardCode = this.user?.customer?.cardCode || '';

    // Check if user is logged in and not a visitor
    if (!this.cardCode || this.user?.customer?.isVisitor) {
      this.errorMessage = 'Please log in with a business account to view account details.';
      this.isLoading = false;
      return;
    }

    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const endDate = new Date().toISOString();
    const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString();

    // Load all data in parallel for better performance
    forkJoin({
      statements: this.storeService.getStoreStatements('Account', endDate, startDate, this.cardCode),
      invoices: this.storeService.getStoreInvoices(50, 1, '', ''),
      payments: this.storeService.getStoreIncomingPayments(50, 1, '', '')
    }).subscribe({
      next: (results: any) => {
        // Process statements - check multiple possible response structures
        this.statementItems = this.extractData(results.statements, ['JournalEntries', 'values', 'value']);
        this.calculateStatementTotals();

        // Process invoices - check multiple possible response structures
        this.invoices = this.extractData(results.invoices, ['values', 'value']);
        this.calculateInvoiceStats();

        // Process payments - check multiple possible response structures
        this.payments = this.extractData(results.payments, ['values', 'value']);
        this.calculatePaymentStats();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading account data:', error);
        this.errorMessage = 'Failed to load account data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Helper to extract data from various response structures
  private extractData(response: any, possibleKeys: string[]): any[] {
    if (!response) return [];

    // Check if response is already an array
    if (Array.isArray(response)) return response;

    // Check each possible key
    for (const key of possibleKeys) {
      if (response[key] && Array.isArray(response[key])) {
        return response[key];
      }
    }

    // If response has a data property
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  }

  private calculateStatementTotals(): void {
    this.totalInvoiced = this.statementItems.reduce((sum: number, item: any) => sum + (item.Debit || 0), 0);
    this.totalPaid = this.statementItems.reduce((sum: number, item: any) => sum + (item.Credit || 0), 0);
    this.balanceDue = this.totalInvoiced - this.totalPaid;
    this.tabs[0].count = this.statementItems.length;
  }

  private calculateInvoiceStats(): void {
    this.openInvoicesCount = this.invoices.filter((inv: any) => !this.isPaid(inv)).length;
    this.outstandingBalance = this.invoices.reduce((sum: number, inv: any) => {
      return sum + ((inv.DocTotal || 0) - (inv.PaidToDate || 0));
    }, 0);
    this.accountBalance = this.outstandingBalance;
    this.tabs[1].count = this.invoices.length;
    this.updateInvoiceFilters();
  }

  private calculatePaymentStats(): void {
    // Filter out cancelled payments
    const validPayments = this.payments.filter((p: any) => p.Cancelled !== 'tYES');

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    this.thisMonthPayments = validPayments.filter((p: any) => {
      const payDate = new Date(p.DocDate);
      return payDate.getMonth() === thisMonth && payDate.getFullYear() === thisYear;
    }).reduce((sum: number, p: any) => sum + this.getPaymentAmount(p), 0);

    this.lastMonthPayments = validPayments.filter((p: any) => {
      const payDate = new Date(p.DocDate);
      return payDate.getMonth() === lastMonth && payDate.getFullYear() === lastMonthYear;
    }).reduce((sum: number, p: any) => sum + this.getPaymentAmount(p), 0);

    this.yearToDatePayments = validPayments.filter((p: any) => {
      const payDate = new Date(p.DocDate);
      return payDate.getFullYear() === thisYear;
    }).reduce((sum: number, p: any) => sum + this.getPaymentAmount(p), 0);

    this.tabs[2].count = validPayments.length;

    // Update payments array to only show valid payments
    this.payments = validPayments;
  }

  // Helper to get payment amount from various field names
  getPaymentAmount(payment: any): number {
    return payment.TransferSum || payment.CashSum || payment.DocTotal || 0;
  }

  refreshData(): void {
    this.loadAllData();
  }

  updateInvoiceFilters(): void {
    this.invoiceFilters = [
      { id: 'all', label: 'All', count: this.invoices.length },
      { id: 'overdue', label: 'Overdue', count: this.invoices.filter(i => this.isOverdue(i)).length },
      { id: 'pending', label: 'Pending', count: this.invoices.filter(i => !this.isPaid(i) && !this.isOverdue(i)).length },
      { id: 'paid', label: 'Paid', count: this.invoices.filter(i => this.isPaid(i)).length }
    ];
  }

  get filteredInvoices(): any[] {
    if (this.invoiceFilter === 'all') return this.invoices;
    if (this.invoiceFilter === 'overdue') return this.invoices.filter(i => this.isOverdue(i));
    if (this.invoiceFilter === 'pending') return this.invoices.filter(i => !this.isPaid(i) && !this.isOverdue(i));
    if (this.invoiceFilter === 'paid') return this.invoices.filter(i => this.isPaid(i));
    return this.invoices;
  }

  isPaid(invoice: any): boolean {
    return (invoice.PaidToDate || 0) >= (invoice.DocTotal || 0);
  }

  isOverdue(invoice: any): boolean {
    if (this.isPaid(invoice)) return false;
    const dueDate = new Date(invoice.DocDueDate);
    return dueDate < new Date();
  }

  getInvoiceStatus(invoice: any): string {
    if (this.isPaid(invoice)) return 'Paid';
    if (this.isOverdue(invoice)) return 'Overdue';
    const dueDate = new Date(invoice.DocDueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 7) return 'Due Soon';
    return 'Pending';
  }

  getInvoiceStatusBgClass(invoice: any): string {
    const status = this.getInvoiceStatus(invoice);
    const classes: { [key: string]: string } = {
      'Overdue': 'bg-red-100',
      'Due Soon': 'bg-yellow-100',
      'Paid': 'bg-green-100',
      'Pending': 'bg-gray-100'
    };
    return classes[status] || 'bg-gray-100';
  }

  getInvoiceStatusTextClass(invoice: any): string {
    const status = this.getInvoiceStatus(invoice);
    const classes: { [key: string]: string } = {
      'Overdue': 'text-red-600',
      'Due Soon': 'text-yellow-600',
      'Paid': 'text-green-600',
      'Pending': 'text-gray-600'
    };
    return classes[status] || 'text-gray-600';
  }

  getInvoiceStatusBadgeClass(invoice: any): string {
    const status = this.getInvoiceStatus(invoice);
    const classes: { [key: string]: string } = {
      'Overdue': 'bg-red-100 text-red-700',
      'Due Soon': 'bg-yellow-100 text-yellow-700',
      'Paid': 'bg-green-100 text-green-700',
      'Pending': 'bg-gray-100 text-gray-700'
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  downloadInvoicePdf(invoice: any): void {
    const user = this.authService.getAuthUser();
    const customer = user?.customer as any;

    const invoiceData: InvoiceData = {
      docNum: invoice.DocNum?.toString() || 'INV-' + invoice.DocEntry,
      invoiceDate: invoice.DocDate || invoice.DocDueDate,
      dueDate: invoice.DocDueDate,
      status: this.getInvoiceStatus(invoice),
      currency: invoice.DocCur || 'USD',
      amount: invoice.DocTotal || 0,
      paidAmount: invoice.PaidToDate || 0,
      description: invoice.Comments || 'Invoice',
      customer: {
        name: customer?.cardName || (user as any)?.companyName || 'Business Customer',
        address: customer?.address || '',
        phone: customer?.phone || '',
        email: customer?.email || (user as any)?.emailAddress || ''
      }
    };

    this.invoicePdfService.generateInvoicePdf(invoiceData);
  }
}
