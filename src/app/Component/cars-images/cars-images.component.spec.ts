import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsImagesComponent } from './cars-images.component';

describe('CarsImagesComponent', () => {
  let component: CarsImagesComponent;
  let fixture: ComponentFixture<CarsImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsImagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarsImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
