import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchingTripComponent } from './searching-trip.component';

describe('SearchingTripComponent', () => {
  let component: SearchingTripComponent;
  let fixture: ComponentFixture<SearchingTripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchingTripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchingTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
