import { Component, forwardRef, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { RangeInterval } from './models/range-interval.model';

export const MAT_RANGE_SLIDER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgxMaterialRangeSliderComponent),
  multi: true
};

const RANGE_SLIDER_CLASS = 'ngx-mat-range-slider';

@Component({
  selector: 'ngx-material-range-slider',
  providers: [MAT_RANGE_SLIDER_VALUE_ACCESSOR],
  templateUrl: 'ngx-material-range-slider.component.html',
  styleUrls: ['ngx-material-range-slider.component.scss']
})
export class NgxMaterialRangeSliderComponent implements ControlValueAccessor, OnInit {
  /* Used for enabling or disabling the slider */
  @Input()
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(isDisabled: boolean) {
    this._disabled = isDisabled;
  }
  private _disabled: boolean = false;

  /* Range, aka the low and high values of the range slider */
  @Input()
  public get range(): RangeInterval {
    return this._range;
  }
  public set range(newRange: RangeInterval) {
    this._range = newRange;
  }
  private _range: RangeInterval = {
    max: 100,
    min: 0
  };

  /* Controls the visibility of thumb label */
  @Input()
  public get thumbLabel(): boolean {
    return this._thumbLabel;
  }
  public set thumbLabel(value: boolean) {
    this._thumbLabel = value;
  }
  private _thumbLabel: boolean = false;

  /* Controls the orientation of the slider */
  @Input()
  public get vertical(): boolean {
    return this._vertical;
  }
  public set vertical(value: boolean) {
    this._vertical = value;
  }
  private _vertical = false;

  /* Low value as percentage of the slider */
  public get lowValuePercent(): number {
    return this._clamp(this._lowValuePercent);
  }
  private _lowValuePercent: number = 0;

  /* High value as percentage of the slider */
  public get highValuePercent(): number {
    return this._clamp(this._highValuePercent);
  }
  private _highValuePercent: number = 0;

  @HostBinding('class') public hostClassName: string = RANGE_SLIDER_CLASS;
  @HostBinding('class.ngx-mat-range-slider-horizontal') public get isHorizontalSlider(): boolean {
    return !this._vertical;
  }
  @HostBinding('class.ngx-mat-range-slider-vertical') public get isVerticalSlider(): boolean {
    return this._vertical;
  }

  @HostListener('blur') public onBlur(): void {
    this._onTouchedCallback();
  }

  public minThumbTransform$!: Observable<string>;
  public maxThumbTransform$!: Observable<string>;

  private _onTouchedCallback: () => void = () => {};

  public ngOnInit(): void {
    this.minThumbTransform$ = of(this.isVerticalSlider ? 'translateY(-70%)' : 'translateX(-70%)');
    this.maxThumbTransform$ = of(this.isVerticalSlider ? 'translateY(-30%)' : 'translateX(-30%)');
  }

  public writeValue(range: RangeInterval): void {
    this._range = range;
  }

  public registerOnChange(): void { }

  public registerOnTouched(onTouchedCallback: any): void {
    this._onTouchedCallback = onTouchedCallback;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private _clamp(value: number, min = 0, max = 1): number {
    return Math.max(min, Math.min(value, max));
  }
}
