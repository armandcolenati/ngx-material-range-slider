import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RangeInterval } from 'projects/ngx-material-range-slider/src/lib/models/range-interval.model';

const HORIZONTAL_DEFAULT_RANGE: RangeInterval = {
  min: 20,
  max: 80
};

const VERTICAL_DEFAULT_RANGE: RangeInterval = {
  min: 40,
  max: 60
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public readonly horizontalSliderControl = new FormControl(HORIZONTAL_DEFAULT_RANGE);
  public readonly verticalSliderControl = new FormControl(VERTICAL_DEFAULT_RANGE);
}
