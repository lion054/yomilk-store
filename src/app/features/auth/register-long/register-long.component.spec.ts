import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterLongComponent } from './register-long.component';

describe('RegisterLongComponent', () => {
  let component: RegisterLongComponent;
  let fixture: ComponentFixture<RegisterLongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterLongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterLongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
