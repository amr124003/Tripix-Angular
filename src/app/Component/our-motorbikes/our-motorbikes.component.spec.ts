import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurMotorbikesComponent } from './our-motorbikes.component';

describe('OurMotorbikesComponent', () => {
  let component: OurMotorbikesComponent;
  let fixture: ComponentFixture<OurMotorbikesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurMotorbikesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurMotorbikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
