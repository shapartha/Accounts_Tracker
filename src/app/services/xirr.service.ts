import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class XIRRService {
  constructor() { }
  private tol = 0.001;

  dateDiff(d1: Date, d2: Date) {
    let day = 24 * 60 * 60 * 1000;
    let diff = (d1.getTime() - d2.getTime());
    return diff / day;
  }

  f_xirr(p: number, dt: Date, dt0: Date, x: number) {
    let calcXirr = p * Math.pow((1.0 + x), (this.dateDiff(dt0, dt) / 365.0));
    return calcXirr;
  }

  df_xirr(p: number, dt: Date, dt0: Date, x: number) {
    return (1.0 / 365.0) * this.dateDiff(dt0, dt) * p * Math.pow((x + 1.0), ((this.dateDiff(dt0, dt) / 365.0) - 1.0));
  }

  total_f_xirr(payments: number[], days: Date[], x: number) {
    let resf = 0.0;
    for (var i = 0; i < payments.length; i++) {
      resf = resf + this.f_xirr(payments[i], days[i], days[0], x);
    }
    return resf;
  }

  total_df_xirr(payments: number[], days: Date[], x: number) {
    let resf = 0.0;
    for (var i = 0; i < payments.length; i++) {
      resf = resf + this.df_xirr(payments[i], days[i], days[0], x);
    }
    return resf;
  }

  getXirrVal(guess: number, payments: number[], days: Date[]) {
    let x0 = guess;
    let x1 = 0.0;
    let err = 1e+100;
    while (err > this.tol && x1 <= 100000) {
      var dfXirr = this.total_df_xirr(payments, days, x0);
      if (dfXirr == 0) {
        break;
      }
      x1 = x0 - this.total_f_xirr(payments, days, x0) / dfXirr;
      err = Math.abs(x1 - x0);
      x0 = x1;
    }
    return x0;
  }
}
