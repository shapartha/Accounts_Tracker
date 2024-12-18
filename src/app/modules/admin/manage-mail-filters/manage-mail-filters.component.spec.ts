import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMailFiltersComponent } from './manage-mail-filters.component';

describe('ManageMailFiltersComponent', () => {
  let component: ManageMailFiltersComponent;
  let fixture: ComponentFixture<ManageMailFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageMailFiltersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageMailFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
