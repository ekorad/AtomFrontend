import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebUsersComponent } from './web-users.component';

describe('WebUsersComponent', () => {
  let component: WebUsersComponent;
  let fixture: ComponentFixture<WebUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
