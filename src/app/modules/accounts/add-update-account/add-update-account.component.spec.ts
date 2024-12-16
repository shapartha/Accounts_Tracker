import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateAccountComponent } from './add-update-account.component';

describe('AddUpdateAccountComponent', () => {
  let component: AddUpdateAccountComponent;
  let fixture: ComponentFixture<AddUpdateAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateAccountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUpdateAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
