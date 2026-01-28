import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayInvoiceComponent } from './pay-invoice.component';

describe('PayInvoiceComponent', () => {
  let component: PayInvoiceComponent;
  let fixture: ComponentFixture<PayInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
