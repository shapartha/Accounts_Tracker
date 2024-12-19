import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMutualFundsComponent } from './add.component';

describe('AddComponent', () => {
  let component: AddMutualFundsComponent;
  let fixture: ComponentFixture<AddMutualFundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMutualFundsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddMutualFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
