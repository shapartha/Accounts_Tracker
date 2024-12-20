import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStocksComponent } from './manage.component';

describe('ManageComponent', () => {
  let component: ManageStocksComponent;
  let fixture: ComponentFixture<ManageStocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageStocksComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageStocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
