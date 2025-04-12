import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurElectricCarsComponent } from './our-electric-cars.component';

describe('OurElectricCarsComponent', () => {
  let component: OurElectricCarsComponent;
  let fixture: ComponentFixture<OurElectricCarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurElectricCarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurElectricCarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
