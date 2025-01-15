import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMfTransComponent } from './update-mf-trans.component';

describe('UpdateMfTransComponent', () => {
  let component: UpdateMfTransComponent;
  let fixture: ComponentFixture<UpdateMfTransComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateMfTransComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateMfTransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
