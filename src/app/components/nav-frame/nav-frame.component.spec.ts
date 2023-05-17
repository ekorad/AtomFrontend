import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavFrameComponent } from './nav-frame.component';

describe('NavFrameComponent', () => {
  let component: NavFrameComponent;
  let fixture: ComponentFixture<NavFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavFrameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
