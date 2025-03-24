import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarLicenseComponent } from './car-license.component';

describe('CarLicenseComponent', () => {
  let component: CarLicenseComponent;
  let fixture: ComponentFixture<CarLicenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarLicenseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
