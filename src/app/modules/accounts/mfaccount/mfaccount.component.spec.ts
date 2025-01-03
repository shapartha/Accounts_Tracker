import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfAccountComponent } from './mfaccount.component';

describe('MfaccountComponent', () => {
  let component: MfAccountComponent;
  let fixture: ComponentFixture<MfAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
