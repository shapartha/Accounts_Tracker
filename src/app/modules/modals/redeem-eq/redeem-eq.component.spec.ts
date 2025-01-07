import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemEqComponent } from './redeem-eq.component';

describe('RedeemEqComponent', () => {
  let component: RedeemEqComponent;
  let fixture: ComponentFixture<RedeemEqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedeemEqComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RedeemEqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
