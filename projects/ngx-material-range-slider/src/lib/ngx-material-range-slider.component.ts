import { Component, forwardRef, HostBinding, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RangeInterval } from './models/range-interval.model';

export const MAT_RANGE_SLIDER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgxMaterialRangeSliderComponent),
  multi: true
};

const RANGE_SLIDER_CLASS = 'mat-range-slider';

@Component({
  selector: 'ngx-material-range-slider',
  providers: [MAT_RANGE_SLIDER_VALUE_ACCESSOR],
  templateUrl: 'ngx-material-range-slider.component.html',
  styleUrls: ['ngx-material-range-slider.component.scss']
})
export class NgxMaterialRangeSliderComponent implements ControlValueAccessor {
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
  @HostBinding('class.mat-range-slider-horizontal]') public isHorizontalSlider(): boolean {
    return !this._vertical;
  }
  @HostBinding('class.mat-range-slider-vertical]') public isVerticalSlider(): boolean {
    return this._vertical;
  }

  private _onChangeCallback: (value: any) => void = () => {};
  private _onTouchedCallback: (value: any) => void = () => {};

  public writeValue(range: RangeInterval): void {
    this._range = range;
  }

  public registerOnChange(onChangeCallback: any): void {
    this._onChangeCallback = onChangeCallback;
  }

  public registerOnTouched(onTouchedCallback: any): void {
    this._onTouchedCallback = onTouchedCallback;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private _clamp(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(value, max));
  }
}
