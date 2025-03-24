import { TestBed } from '@angular/core/testing';

import { VariabletransferService } from './variabletransfer.service';

describe('VariabletransferService', () => {
  let service: VariabletransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VariabletransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
