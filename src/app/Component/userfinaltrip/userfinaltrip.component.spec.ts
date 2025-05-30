import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserfinaltripComponent } from './userfinaltrip.component';

describe('UserfinaltripComponent', () => {
  let component: UserfinaltripComponent;
  let fixture: ComponentFixture<UserfinaltripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserfinaltripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserfinaltripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
