import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedPayCardComponent } from './animated-pay-card.component';

describe('AnimatedPayCardComponent', () => {
  let component: AnimatedPayCardComponent;
  let fixture: ComponentFixture<AnimatedPayCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedPayCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimatedPayCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
