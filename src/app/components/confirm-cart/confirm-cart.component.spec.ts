import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCartComponent } from './confirm-cart.component';

describe('ConfirmCartComponent', () => {
  let component: ConfirmCartComponent;
  let fixture: ComponentFixture<ConfirmCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmCartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
