import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMaterialRangeSliderComponent } from './ngx-material-range-slider.component';

describe('NgxMaterialRangeSliderComponent', () => {
  let component: NgxMaterialRangeSliderComponent;
  let fixture: ComponentFixture<NgxMaterialRangeSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxMaterialRangeSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxMaterialRangeSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
