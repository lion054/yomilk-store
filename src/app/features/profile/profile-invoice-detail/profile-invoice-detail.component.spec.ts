import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileInvoiceDetailComponent } from './profile-invoice-detail.component';

describe('ProfileInvoiceDetailComponent', () => {
  let component: ProfileInvoiceDetailComponent;
  let fixture: ComponentFixture<ProfileInvoiceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileInvoiceDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileInvoiceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
