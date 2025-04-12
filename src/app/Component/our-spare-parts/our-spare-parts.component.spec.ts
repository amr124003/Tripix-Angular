import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurSparePartsComponent } from './our-spare-parts.component';

describe('OurSparePartsComponent', () => {
  let component: OurSparePartsComponent;
  let fixture: ComponentFixture<OurSparePartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurSparePartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurSparePartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
