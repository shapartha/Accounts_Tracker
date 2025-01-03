import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemMfComponent } from './redeem-mf.component';

describe('RedeemMfComponent', () => {
  let component: RedeemMfComponent;
  let fixture: ComponentFixture<RedeemMfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedeemMfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RedeemMfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
