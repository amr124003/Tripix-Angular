import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddcarPhohtosComponent } from './addcar-phohtos.component';

describe('AddcarPhohtosComponent', () => {
  let component: AddcarPhohtosComponent;
  let fixture: ComponentFixture<AddcarPhohtosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddcarPhohtosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddcarPhohtosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
