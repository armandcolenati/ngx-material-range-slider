import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RangeInterval } from 'projects/ngx-material-range-slider/src/lib/models/range-interval.model';

const HORIZONTAL_DEFAULT_RANGE: RangeInterval = {
  min: 20,
  max: 80
};

const VERTICAL_DEFAULT_RANGE: RangeInterval = {
  min: 30,
  max: 70
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public readonly horizontalSliderControl = new FormControl(HORIZONTAL_DEFAULT_RANGE);
  public readonly horizontalSliderMinLimitControl = new FormControl(0);
  public readonly horizontalSliderMaxLimitControl = new FormControl(100);
  
  public readonly verticalSliderControl = new FormControl(VERTICAL_DEFAULT_RANGE);
  public readonly verticalSliderMinLimitControl = new FormControl(0);
  public readonly verticalSliderMaxLimitControl = new FormControl(100);
  
  public readonly dynamicSliderControl = new FormControl(HORIZONTAL_DEFAULT_RANGE);
  public readonly dynamicSliderVerticalControl = new FormControl(false);
}
