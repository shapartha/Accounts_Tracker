import { TestBed } from '@angular/core/testing';

import { XIRRService } from './xirr.service';

describe('XIRRService', () => {
  let service: XIRRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XIRRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
