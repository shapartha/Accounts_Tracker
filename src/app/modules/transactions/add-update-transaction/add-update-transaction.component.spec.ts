import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateTransactionComponent } from './add-update-transaction.component';

describe('AddUpdateTransactionComponent', () => {
  let component: AddUpdateTransactionComponent;
  let fixture: ComponentFixture<AddUpdateTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUpdateTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
