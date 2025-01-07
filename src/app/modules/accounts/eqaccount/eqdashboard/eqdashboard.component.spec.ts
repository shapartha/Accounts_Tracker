import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqDashboardComponent } from './eqdashboard.component';

describe('EqdashboardComponent', () => {
  let component: EqDashboardComponent;
  let fixture: ComponentFixture<EqDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EqDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EqDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
