import { Component, ElementRef, forwardRef, HostBinding, HostListener, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { RangeInterval } from './models/range-interval.model';

export const MAT_RANGE_SLIDER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgxMaterialRangeSliderComponent),
  multi: true
};

const RANGE_SLIDER_CLASS = 'ngx-mat-range-slider';

const DEFAULT_RANGE_LIMIT: RangeInterval = {
  max: 100,
  min: 0
};

const HORIZONTAL_SLIDER_CLASS = 'ngx-mat-range-slider-horizontal';
const VERTICAL_SLIDER_CLASS = 'ngx-mat-range-slider-vertical';

@Component({
  selector: 'ngx-material-range-slider',
  providers: [MAT_RANGE_SLIDER_VALUE_ACCESSOR],
  templateUrl: 'ngx-material-range-slider.component.html',
  styleUrls: ['ngx-material-range-slider.component.scss']
})
export class NgxMaterialRangeSliderComponent implements ControlValueAccessor, OnInit, OnDestroy {
  /* Used for enabling or disabling the slider */
  @Input()
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(isDisabled: boolean) {
    this._disabled = isDisabled;
  }
  private _disabled: boolean = false;

  /* Min limit of range */
  @Input()
  public set min(minLimit: number | null) {
    if (minLimit !== null) {
      this.minRangeLimitSubject.next(minLimit);
    }
  }

  /* Min limit of range */
  @Input()
  public set max(maxLimit: number | null) {
    if (maxLimit !== null) {
      this.maxRangeLimitSubject.next(maxLimit);
    }
  }

  /* Range, aka the low and high values of the range slider */
  @Input()
  public set range(rangeLimit: RangeInterval | null) {
    if (rangeLimit) {
      this.minRangeLimitSubject.next(rangeLimit.min);
      this.maxRangeLimitSubject.next(rangeLimit.max);
    }
  }

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
  public set vertical(isVertical: boolean | null) {
    if (isVertical !== null) {
      this.isVerticalSubject.next(isVertical);
    }
  }

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

  @HostListener('blur') public onBlur(): void {
    this._onTouchedCallback();
  }

  public minThumbTransform$!: Observable<string>;
  public maxThumbTransform$!: Observable<string>;

  private _onTouchedCallback: () => void = () => {};

  private readonly isVerticalSubject = new BehaviorSubject<boolean>(false);
  private readonly minRangeLimitSubject = new BehaviorSubject<number>(DEFAULT_RANGE_LIMIT.min);
  private readonly maxRangeLimitSubject = new BehaviorSubject<number>(DEFAULT_RANGE_LIMIT.max);
  private readonly rangeValueSubject = new BehaviorSubject<RangeInterval>(DEFAULT_RANGE_LIMIT);

  private readonly subscriptions = new Subscription();

  constructor(private readonly elementRef: ElementRef, private readonly renderer: Renderer2) { }

  public ngOnInit(): void {
    const rangeValuePercentages$ = combineLatest([
      this.minRangeLimitSubject,
      this.maxRangeLimitSubject,
      this.rangeValueSubject
    ]).pipe(
      map(([minRangeLimit, maxRangeLimit, rangeValue]) => ({
        minPercentage: rangeValue.min / (maxRangeLimit - minRangeLimit),
        maxPercentage: rangeValue.max / (maxRangeLimit - minRangeLimit),
      }))
    );

    const thumbsTransforms$ = combineLatest([
      this.isVerticalSubject,
      rangeValuePercentages$
    ]).pipe(
      map(([isVertical, rangePercentages]) => {
        const orientationAxis = isVertical ? 'Y' : 'X';

        const minOffset = (1 - rangePercentages.minPercentage) * 100;
        const maxOffset = (1 - rangePercentages.maxPercentage) * 100;

        return {
          min: `translate${orientationAxis}(-${minOffset}%)`,
          max: `translate${orientationAxis}(-${maxOffset}%)`
        }
      })
    );

    this.minThumbTransform$ = thumbsTransforms$.pipe(
      map((thumbsTransforms) => thumbsTransforms.min),
      distinctUntilChanged((transform1, transform2) => transform1 === transform2)
    );
  
    this.maxThumbTransform$ = thumbsTransforms$.pipe(
      map((thumbsTransforms) => thumbsTransforms.max),
      distinctUntilChanged((transform1, transform2) => transform1 === transform2)
    );

    this.subscriptions.add(this.syncSliderOrientation());
  }

  public ngOnDestroy(): void {
    this.isVerticalSubject.complete();
    this.minRangeLimitSubject.complete();
    this.maxRangeLimitSubject.complete();
    this.rangeValueSubject.complete();

    this.subscriptions.unsubscribe();
  }

  public writeValue(range: RangeInterval | null): void {
    if (range) {
      this.rangeValueSubject.next(range);
    }
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

  /* Subscriptions */
  private syncSliderOrientation(): Subscription {
    return this.isVerticalSubject.subscribe((isVertical) => {
      const sliderElement = this.elementRef.nativeElement;

      if (isVertical) {
        this.renderer.addClass(sliderElement, VERTICAL_SLIDER_CLASS);
        this.renderer.removeClass(sliderElement, HORIZONTAL_SLIDER_CLASS);

        return;
      }

      this.renderer.addClass(sliderElement, HORIZONTAL_SLIDER_CLASS);
      this.renderer.removeClass(sliderElement, VERTICAL_SLIDER_CLASS);
    })
  }
}
