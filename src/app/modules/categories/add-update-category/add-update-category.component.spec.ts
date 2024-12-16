import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateCategoryComponent } from './add-update-category.component';

describe('AddUpdateCategoryComponent', () => {
  let component: AddUpdateCategoryComponent;
  let fixture: ComponentFixture<AddUpdateCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateCategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUpdateCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
