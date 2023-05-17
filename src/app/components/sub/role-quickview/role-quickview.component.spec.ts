import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleQuickviewComponent } from './role-quickview.component';

describe('RoleQuickviewComponent', () => {
  let component: RoleQuickviewComponent;
  let fixture: ComponentFixture<RoleQuickviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoleQuickviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleQuickviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
