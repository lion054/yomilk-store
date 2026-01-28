import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePasswordsComponent } from './profile-passwords.component';

describe('ProfilePasswordsComponent', () => {
  let component: ProfilePasswordsComponent;
  let fixture: ComponentFixture<ProfilePasswordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePasswordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilePasswordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
