import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TIPComponent } from './tip.component';

describe('TIPComponent', () => {
  let component: TIPComponent;
  let fixture: ComponentFixture<TIPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TIPComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TIPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
