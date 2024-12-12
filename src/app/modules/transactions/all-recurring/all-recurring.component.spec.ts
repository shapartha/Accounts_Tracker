import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllRecurringComponent } from './all-recurring.component';

describe('AllRecurringComponent', () => {
  let component: AllRecurringComponent;
  let fixture: ComponentFixture<AllRecurringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllRecurringComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllRecurringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
