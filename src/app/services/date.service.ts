import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  helper: DatePipe
  constructor(dateHelper: DatePipe ) {
    this.helper = dateHelper;
   }

  getChinaTime(): string {
    return this.helper.transform(new Date(), "yyyy/MM/dd hh:mm:ss", "GMT+8")
  }
}
