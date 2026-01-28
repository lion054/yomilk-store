import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileStatementsComponent } from './profile-statements.component';

describe('ProfileStatementsComponent', () => {
  let component: ProfileStatementsComponent;
  let fixture: ComponentFixture<ProfileStatementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileStatementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileStatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
