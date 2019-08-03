import { TestBed } from '@angular/core/testing';

import { MessageRequestService } from './message-request.service';

describe('MessageRequestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MessageRequestService = TestBed.get(MessageRequestService);
    expect(service).toBeTruthy();
  });
});
