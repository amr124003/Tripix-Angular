import { TestBed } from '@angular/core/testing';

import { OrderTripService } from './order-trip.service';

describe('OrderTripService', () => {
  let service: OrderTripService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderTripService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
