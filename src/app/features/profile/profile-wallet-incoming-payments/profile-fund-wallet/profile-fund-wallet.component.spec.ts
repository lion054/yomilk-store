import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileFundWalletComponent } from './profile-fund-wallet.component';

describe('ProfileFundWalletComponent', () => {
  let component: ProfileFundWalletComponent;
  let fixture: ComponentFixture<ProfileFundWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileFundWalletComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileFundWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
