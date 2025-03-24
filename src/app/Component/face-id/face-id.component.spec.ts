import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceIDComponent } from './face-id.component';

describe('FaceIDComponent', () => {
  let component: FaceIDComponent;
  let fixture: ComponentFixture<FaceIDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceIDComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceIDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
