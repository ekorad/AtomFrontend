import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailsViewerComponent } from './order-details-viewer.component';

describe('OrderDetailsViewerComponent', () => {
  let component: OrderDetailsViewerComponent;
  let fixture: ComponentFixture<OrderDetailsViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderDetailsViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
