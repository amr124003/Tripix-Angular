import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarWashComponent } from './car-wash.component';

describe('CarWashComponent', () => {
  let component: CarWashComponent;
  let fixture: ComponentFixture<CarWashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarWashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarWashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
