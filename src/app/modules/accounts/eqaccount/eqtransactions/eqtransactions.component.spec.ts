import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqTransactionsComponent } from './eqtransactions.component';

describe('EqtransactionsComponent', () => {
  let component: EqTransactionsComponent;
  let fixture: ComponentFixture<EqTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EqTransactionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EqTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
