import { TestBed } from '@angular/core/testing';
import { MockApiStoreService } from './mock-api-store.service';

describe('MockApiStoreService', () => {
  let service: MockApiStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockApiStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
