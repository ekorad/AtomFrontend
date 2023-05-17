import { TestBed } from '@angular/core/testing';

import { PersonalExpService } from './personal-exp.service';

describe('PersonalExpService', () => {
  let service: PersonalExpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalExpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
