import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroCTAComponent } from './hero-cta.component';

describe('HeroCTAComponent', () => {
  let component: HeroCTAComponent;
  let fixture: ComponentFixture<HeroCTAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroCTAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroCTAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
