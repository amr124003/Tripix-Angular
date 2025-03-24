import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestooComponent } from './prombet.component';

describe('TestooComponent', () => {
  let component: TestooComponent;
  let fixture: ComponentFixture<TestooComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestooComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestooComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
