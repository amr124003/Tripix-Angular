import { TestBed } from '@angular/core/testing';

import { ElctricCarsService } from './elctric-cars.service';

describe('ElctricCarsService', () => {
  let service: ElctricCarsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElctricCarsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
