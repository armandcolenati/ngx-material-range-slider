import { AfterViewInit, Component, ElementRef, forwardRef, HostBinding, HostListener, Input, NgZone, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
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
const RANGE_SLIDER_DISABLED_CLASS = 'ngx-mat-range-slider-disabled';

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
export class NgxMaterialRangeSliderComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  /* Used for enabling or disabling the slider */
  @Input()
  public set disabled(isDisabled: boolean | null) {
    if (isDisabled !== null) {
      this.isDisabledSubject.next(isDisabled);
    }
  }

  /* Min limit of range */
  @Input()
  public set min(minLimit: number | null) {
    if (minLimit !== null) {
      this.minRangeLimitSubject.next(minLimit);
    }
  }

  /* Max limit of range */
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

  /* Controls the orientation of the slider */
  @Input()
  public set vertical(isVertical: boolean | null) {
    if (isVertical !== null) {
      this.isVerticalSubject.next(isVertical);
    }
  }

  @HostBinding('class') public hostClassName: string = RANGE_SLIDER_CLASS;

  @HostListener('blur') public onBlur(): void {
    this._onTouchedCallback();
  }

  @ViewChild('minThumb') public readonly minThumbRef!: ElementRef<HTMLElement>;
  @ViewChild('maxThumb') public readonly maxThumbRef!: ElementRef<HTMLElement>;

  public fillerTransform$!: Observable<string>;
  public minThumbTransform$!: Observable<string>;
  public maxThumbTransform$!: Observable<string>;

  private _onTouchedCallback: () => void = () => {};

  private minValuePercent$!: Observable<number>;
  private maxValuePercent$!: Observable<number>;

  private readonly isDisabledSubject = new BehaviorSubject<boolean>(false);
  private readonly isVerticalSubject = new BehaviorSubject<boolean>(false);
  private readonly minRangeLimitSubject = new BehaviorSubject<number>(DEFAULT_RANGE_LIMIT.min);
  private readonly maxRangeLimitSubject = new BehaviorSubject<number>(DEFAULT_RANGE_LIMIT.max);
  private readonly rangeValueSubject = new BehaviorSubject<RangeInterval>(DEFAULT_RANGE_LIMIT);

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2,
    private readonly ngZone: NgZone
  ) { }

  public ngOnInit(): void {
    this._initObservables();

    const minThumbOffset$ = this.minValuePercent$.pipe(
      map((minPercent) => (1 - minPercent) * 100)
    );

    const maxThumbOffset$ = this.maxValuePercent$.pipe(
      map((maxPercent) => (1 - maxPercent) * 100)
    );

    const thumbsTransforms$ = combineLatest([
      this.isVerticalSubject,
      minThumbOffset$,
      maxThumbOffset$
    ]).pipe(
      map(([isVertical, minThumbOffset, maxThumbOffset]) => {
        const orientationAxis = isVertical ? 'Y' : 'X';

        return {
          min: `translate${orientationAxis}(-${minThumbOffset}%)`,
          max: `translate${orientationAxis}(-${maxThumbOffset}%)`
        }
      })
    );

    this.fillerTransform$ = combineLatest([
      this.isVerticalSubject,
      minThumbOffset$,
      this.minValuePercent$,
      this.maxValuePercent$
    ]).pipe(
      map(([isVertical, minThumbOffset, minValuePercent, maxValuePercent]) => {
        const orientationAxis = isVertical ? 'Y' : 'X';
        const scalePercent = maxValuePercent - minValuePercent;
        const scale = isVertical ? `1, ${scalePercent}, 1` : `${scalePercent}, 1, 1`;

        return `translate${orientationAxis}(${100 - minThumbOffset}%) scale3d(${scale})`;
      })
    )

    this.minThumbTransform$ = thumbsTransforms$.pipe(
      map((thumbsTransforms) => thumbsTransforms.min),
      distinctUntilChanged((transform1, transform2) => transform1 === transform2)
    );
  
    this.maxThumbTransform$ = thumbsTransforms$.pipe(
      map((thumbsTransforms) => thumbsTransforms.max),
      distinctUntilChanged((transform1, transform2) => transform1 === transform2)
    );

    const subscriptionsCollection = [
      this._syncSliderDisabledState(),
      this._syncSliderOrientation()
    ]

    subscriptionsCollection.forEach((subscription) => this.subscriptions.add(subscription));
  }

  public ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.minThumbRef.nativeElement.addEventListener('mousedown', this._minThumbPointerDown);
      this.minThumbRef.nativeElement.addEventListener('touchstart', this._minThumbPointerDown);
      
      this.maxThumbRef.nativeElement.addEventListener('mousedown', this._maxThumbPointerDown);
      this.maxThumbRef.nativeElement.addEventListener('touchstart', this._maxThumbPointerDown);
    });
  }

  public ngOnDestroy(): void {
    this.isVerticalSubject.complete();
    this.minRangeLimitSubject.complete();
    this.maxRangeLimitSubject.complete();
    this.rangeValueSubject.complete();

    this.subscriptions.unsubscribe();

    this._removeLocalEvents();
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
    this.isDisabledSubject.next(isDisabled);
  }

  private _initObservables(): void {
    const rangeValuePercents$ = combineLatest([
      this.minRangeLimitSubject,
      this.maxRangeLimitSubject,
      this.rangeValueSubject
    ]).pipe(
      map(([minRangeLimit, maxRangeLimit, rangeValue]) => ({
        minPercent: rangeValue.min / (maxRangeLimit - minRangeLimit),
        maxPercent: rangeValue.max / (maxRangeLimit - minRangeLimit),
      }))
    );

    this.minValuePercent$ = rangeValuePercents$.pipe(
      map((rangePercents) => rangePercents.minPercent),
      distinctUntilChanged()
    );

    this.maxValuePercent$ = rangeValuePercents$.pipe(
      map((rangePercents) => rangePercents.maxPercent),
      distinctUntilChanged()
    );
  }

  /* Events */
  private _minThumbPointerDown(): void { }

  private _maxThumbPointerDown(): void { }

  private _removeLocalEvents(): void {
    this.minThumbRef.nativeElement.removeEventListener('mousedown', this._minThumbPointerDown);
    this.minThumbRef.nativeElement.removeEventListener('touchstart', this._minThumbPointerDown);
    
    this.maxThumbRef.nativeElement.removeEventListener('mousedown', this._maxThumbPointerDown);
    this.maxThumbRef.nativeElement.removeEventListener('touchstart', this._maxThumbPointerDown);
  }

  /* Subscriptions */
  private _syncSliderDisabledState(): Subscription {
    return this.isDisabledSubject.subscribe((isDisabled) => {
      const sliderElement = this.elementRef.nativeElement;

      isDisabled
        ? this.renderer.addClass(sliderElement, RANGE_SLIDER_DISABLED_CLASS)
        : this.renderer.removeClass(sliderElement, RANGE_SLIDER_DISABLED_CLASS);
    });
  }

  private _syncSliderOrientation(): Subscription {
    return this.isVerticalSubject.subscribe((isVertical) => {
      const sliderElement = this.elementRef.nativeElement;

      if (isVertical) {
        this.renderer.addClass(sliderElement, VERTICAL_SLIDER_CLASS);
        this.renderer.removeClass(sliderElement, HORIZONTAL_SLIDER_CLASS);

        return;
      }

      this.renderer.addClass(sliderElement, HORIZONTAL_SLIDER_CLASS);
      this.renderer.removeClass(sliderElement, VERTICAL_SLIDER_CLASS);
    });
  }
}
