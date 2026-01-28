import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekendNoticeComponent } from './weekend-notice.component';

describe('WeekendNoticeComponent', () => {
  let component: WeekendNoticeComponent;
  let fixture: ComponentFixture<WeekendNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekendNoticeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeekendNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
