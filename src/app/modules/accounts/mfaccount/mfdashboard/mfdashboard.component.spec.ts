import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfDashboardComponent } from './mfdashboard.component';

describe('MfdashboardComponent', () => {
  let component: MfDashboardComponent;
  let fixture: ComponentFixture<MfDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
