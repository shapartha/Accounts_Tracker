import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoMailsComponent } from './auto-mails.component';

describe('AutoMailsComponent', () => {
  let component: AutoMailsComponent;
  let fixture: ComponentFixture<AutoMailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoMailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AutoMailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
