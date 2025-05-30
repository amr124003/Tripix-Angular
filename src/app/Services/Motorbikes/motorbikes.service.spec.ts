import { TestBed } from '@angular/core/testing';

import { MotorbikesService } from './motorbikes.service';

describe('MotorbikesService', () => {
  let service: MotorbikesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotorbikesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
