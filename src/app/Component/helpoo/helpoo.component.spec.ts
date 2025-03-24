import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpooComponent } from './helpoo.component';

describe('HelpooComponent', () => {
  let component: HelpooComponent;
  let fixture: ComponentFixture<HelpooComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpooComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpooComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
