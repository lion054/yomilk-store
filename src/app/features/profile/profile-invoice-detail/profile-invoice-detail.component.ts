import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {StoreService} from "../../../core/services/store/store.service";
import {BrowserModule, DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {AuthService} from "../../../core/services/auth/auth.service";
import {DatePipe, DecimalPipe, NgIf} from "@angular/common";
import {QRCodeComponent} from "angularx-qrcode";
import {NgxPrintModule} from "ngx-print";

@Component({
  selector: 'app-profile-invoice-detail',
  standalone: true,
  imports: [
    RouterModule,
    NgIf,
    QRCodeComponent,
    DecimalPipe,
    NgxPrintModule,
    DatePipe
  ],
  templateUrl: './profile-invoice-detail.component.html',
  styleUrl: './profile-invoice-detail.component.css'
})
export class ProfileInvoiceDetailComponent implements OnInit{

  invoice:any
  companyName:any = ''
  QR: any = ''
  iframeUrl: any;


  constructor( private storeService:StoreService,private route: ActivatedRoute, private authService:AuthService, private sanitizer: DomSanitizer) {

  }

  ngOnInit() {

    this.companyName = this.authService.getAuthUser().customer?.cardName

    this.invoice = history.state.data;
    console.log("Received Invoice:", this.invoice);
    if(this.invoice == null){
      this.route.queryParams.subscribe((params:any) =>{
        this.storeService.getSingleInvoiceByDocEntry(params['invoiceNum']).subscribe((res:any) => {
          this.invoice = res;
        })
      })
    }

    if (this.invoice) {
      // const url = `https://cb-order-trackingv1-f5dovyimaq-ew.a.run.app/#/ratings/1PxS7ee044j32sPsIuXg`;
      this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://cb-order-trackingv1-f5dovyimaq-ew.a.run.app/#/ratings/${this.invoice.TrackingNumber}`);

      console.log(this.iframeUrl);
    }


  }

  printInvoice() {
    const divContents = document.getElementById('invoice')?.innerHTML;
    if (!divContents) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const printStyles = `
  <style>
    @media print {
      @page {
        size: auto;
        margin-top: 10mm;
        margin-bottom: 5mm;
      }
    }
  </style>
`;
    // Copy styles from the document head to the print window
    const headContents = document.head.innerHTML;

    // printWindow.document.write(`<html><head><title>SnappyFresh Invoice ${this.invoice.DocNum}</title>`);
    // printWindow.document.write(headContents);
    // printWindow.document.write('</head><body>');
    // printWindow.document.write(divContents);
    // printWindow.document.write('</body></html>');

    printWindow.document.write(`
  <html>
    <head>
      <title>SnappyFresh Invoice ${this.invoice.DocNum}</title>
      ${headContents}
      ${printStyles}
    </head>
    <body>
      ${divContents}
    </body>
  </html>
`);

    printWindow.document.close();
    printWindow.focus(); // Brings printWindow to focus (optional)
    printWindow.print();
  }

  getDeliveryFee() {
    let deliveryFee = this.invoice.DocumentAdditionalExpenses.find((expense:any) => expense.Remarks.includes('Delivery'));
    return deliveryFee.LineGross || 0;
  }

  calculateVat() {
    return this.invoice.VatSum || 0;
  }

  getTotal() {
    return this.invoice.PaidToDate || 0;
  }
}
