import { TestBed } from '@angular/core/testing';

import { ConnectDriverService } from './connect-driver.service';

describe('ConnectDriverService', () => {
  let service: ConnectDriverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectDriverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
