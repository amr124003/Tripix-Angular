import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarMaintenanceComponent } from './car-maintenance.component';

describe('CarMaintenanceComponent', () => {
  let component: CarMaintenanceComponent;
  let fixture: ComponentFixture<CarMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarMaintenanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
