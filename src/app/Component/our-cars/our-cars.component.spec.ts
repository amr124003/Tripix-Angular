import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurCarsComponent } from './our-cars.component';

describe('OurCarsComponent', () => {
  let component: OurCarsComponent;
  let fixture: ComponentFixture<OurCarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurCarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurCarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
