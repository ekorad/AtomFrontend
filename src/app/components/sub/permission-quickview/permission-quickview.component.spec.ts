import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionQuickviewComponent } from './permission-quickview.component';

describe('PermissionQuickviewComponent', () => {
  let component: PermissionQuickviewComponent;
  let fixture: ComponentFixture<PermissionQuickviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionQuickviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionQuickviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
