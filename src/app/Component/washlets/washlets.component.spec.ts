import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WashletsComponent } from './washlets.component';

describe('WashletsComponent', () => {
  let component: WashletsComponent;
  let fixture: ComponentFixture<WashletsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WashletsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WashletsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
