import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RangeInterval } from 'projects/ngx-material-range-slider/src/lib/models/range-interval.model';

const DEFAULT_RANGE: RangeInterval = {
  min: 1,
  max: 10
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public readonly rangeSliderControl = new FormControl(DEFAULT_RANGE);
}
