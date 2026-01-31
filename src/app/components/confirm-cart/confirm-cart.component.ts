import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CurrencyPipe } from "@angular/common";

@Component({
  selector: 'app-confirm-cart',
  standalone: true,
  imports: [
    CurrencyPipe
],
  templateUrl: './confirm-cart.component.html',
  styleUrl: './confirm-cart.component.css'
})
export class ConfirmCartComponent {
  @Input() checkoutData!: any;
  @Output() checkout  = new EventEmitter<any>();
  @Output() cancel  = new EventEmitter<any>();

  get formattedDate(): string {
    return new Date(this.checkoutData?.cartTime).toLocaleString();
  }

  get subtotal(): number {
    return this.checkoutData?.documentLines.reduce((sum:any, line:any) => sum + line.lineTotal, 0) || 0;
  }

  get additionalExpensesTotal(): number {
    return this.checkoutData?.additionalExpenses.reduce((sum:any, expense:any) => sum + expense.lineTotalAfterVAT, 0) || 0;
  }

  onCheckout(): void {
    this.checkout.emit(this.checkoutData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
