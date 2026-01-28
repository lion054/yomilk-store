import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialPresenceComponent } from './social-presence.component';

describe('SocialPresenceComponent', () => {
  let component: SocialPresenceComponent;
  let fixture: ComponentFixture<SocialPresenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialPresenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialPresenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
