import { TestBed } from '@angular/core/testing';

import { RequestTableService } from './request-table.service';

describe('RequestTableService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RequestTableService = TestBed.get(RequestTableService);
    expect(service).toBeTruthy();
  });
});
