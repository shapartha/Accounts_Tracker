import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfTransactionsComponent } from './mftransactions.component';

describe('MftransactionsComponent', () => {
  let component: MfTransactionsComponent;
  let fixture: ComponentFixture<MfTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfTransactionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
