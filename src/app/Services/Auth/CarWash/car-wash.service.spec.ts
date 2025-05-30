import { TestBed } from '@angular/core/testing';

import { CarWashService } from './car-wash.service';

describe('CarWashService', () => {
  let service: CarWashService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarWashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
