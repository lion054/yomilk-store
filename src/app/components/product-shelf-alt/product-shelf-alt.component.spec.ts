import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductShelfAltComponent } from './product-shelf-alt.component';

describe('ProductShelfAltComponent', () => {
  let component: ProductShelfAltComponent;
  let fixture: ComponentFixture<ProductShelfAltComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductShelfAltComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductShelfAltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
