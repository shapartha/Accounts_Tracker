import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MftransactionsComponent } from './mftransactions.component';

describe('MftransactionsComponent', () => {
  let component: MftransactionsComponent;
  let fixture: ComponentFixture<MftransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MftransactionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MftransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
