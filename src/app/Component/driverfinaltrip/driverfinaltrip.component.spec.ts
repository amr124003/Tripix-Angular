import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverfinaltripComponent } from './driverfinaltrip.component';

describe('DriverfinaltripComponent', () => {
  let component: DriverfinaltripComponent;
  let fixture: ComponentFixture<DriverfinaltripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverfinaltripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverfinaltripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
