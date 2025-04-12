import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveDriverLocationComponent } from './live-driver-location.component';

describe('LiveDriverLocationComponent', () => {
  let component: LiveDriverLocationComponent;
  let fixture: ComponentFixture<LiveDriverLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveDriverLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveDriverLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
