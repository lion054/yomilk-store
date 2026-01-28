import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileInvoicesComponent } from './profile-invoices.component';

describe('ProfileInvoicesComponent', () => {
  let component: ProfileInvoicesComponent;
  let fixture: ComponentFixture<ProfileInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
