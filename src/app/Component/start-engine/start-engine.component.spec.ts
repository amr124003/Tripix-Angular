import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartEngineComponent } from './start-engine.component';

describe('StartEngineComponent', () => {
  let component: StartEngineComponent;
  let fixture: ComponentFixture<StartEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartEngineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
