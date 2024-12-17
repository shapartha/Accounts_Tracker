import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapStockComponent } from './map-stock.component';

describe('MapStockComponent', () => {
  let component: MapStockComponent;
  let fixture: ComponentFixture<MapStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MapStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
