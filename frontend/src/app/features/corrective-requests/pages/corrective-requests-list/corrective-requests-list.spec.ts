import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrectiveRequestsList } from './corrective-requests-list';

describe('CorrectiveRequestsList', () => {
  let component: CorrectiveRequestsList;
  let fixture: ComponentFixture<CorrectiveRequestsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorrectiveRequestsList],
    }).compileComponents();

    fixture = TestBed.createComponent(CorrectiveRequestsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
