import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqAccountComponent } from './eqaccount.component';

describe('EqaccountComponent', () => {
  let component: EqAccountComponent;
  let fixture: ComponentFixture<EqAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EqAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EqAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
