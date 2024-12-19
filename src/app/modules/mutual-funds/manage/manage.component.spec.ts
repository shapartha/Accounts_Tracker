import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMutualFundsComponent } from './manage.component';

describe('ManageComponent', () => {
  let component: ManageMutualFundsComponent;
  let fixture: ComponentFixture<ManageMutualFundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageMutualFundsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageMutualFundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
