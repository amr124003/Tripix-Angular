import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripixComponent } from './tripix.component';

describe('TripixComponent', () => {
  let component: TripixComponent;
  let fixture: ComponentFixture<TripixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
