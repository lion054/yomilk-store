import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileStatementDetailComponent } from './profile-statement-detail.component';

describe('ProfileStatementDetailComponent', () => {
  let component: ProfileStatementDetailComponent;
  let fixture: ComponentFixture<ProfileStatementDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileStatementDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileStatementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
