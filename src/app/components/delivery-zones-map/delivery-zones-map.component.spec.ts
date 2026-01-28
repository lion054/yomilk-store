import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryZonesMapComponent } from './delivery-zones-map.component';

describe('DeliveryZonesMapComponent', () => {
  let component: DeliveryZonesMapComponent;
  let fixture: ComponentFixture<DeliveryZonesMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryZonesMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryZonesMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
