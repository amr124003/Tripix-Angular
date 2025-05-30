import { TestBed } from '@angular/core/testing';

import { GetCarsService } from './get-cars.service';

describe('GetCarsService', () => {
  let service: GetCarsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetCarsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
