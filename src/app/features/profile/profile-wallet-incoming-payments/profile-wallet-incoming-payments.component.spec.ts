import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileWalletIncomingPaymentsComponent } from './profile-wallet-incoming-payments.component';

describe('ProfileWalletIncomingPaymentsComponent', () => {
  let component: ProfileWalletIncomingPaymentsComponent;
  let fixture: ComponentFixture<ProfileWalletIncomingPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileWalletIncomingPaymentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileWalletIncomingPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
