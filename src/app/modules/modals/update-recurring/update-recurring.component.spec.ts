import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRecurringComponent } from './update-recurring.component';

describe('UpdateRecurringComponent', () => {
  let component: UpdateRecurringComponent;
  let fixture: ComponentFixture<UpdateRecurringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateRecurringComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateRecurringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
