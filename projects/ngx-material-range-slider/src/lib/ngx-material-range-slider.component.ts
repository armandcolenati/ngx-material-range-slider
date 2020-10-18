import { Component, forwardRef, HostBinding, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RangeInterval {
  end: number;
  start: number;
}

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

  /* Superior limit of the range slider */
  @Input()
  public get max(): number {
    return this._max;
  }
  public set max(maxValue: number) {
    this._max = maxValue;
  }
  private _max: number = 100;

  /* Inferior limit of the range slider */
  @Input()
  public get min(): number {
    return this._min;
  }
  public set min(minValue: number) {
    this._min = minValue;
  }
  private _min: number = 0;

  /* Range, aka the low and high values of the range slider */
  @Input()
  public get range(): RangeInterval | null {
    if (this._range === null) {
      this._range = {
        end: this._max,
        start: this._min
      };
    }

    return this._range;
  }
  public set range(newRange: RangeInterval | null) {
    this._range = newRange;
  }
  private _range: RangeInterval | null = null;

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
