import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from 'app/const/app.constants';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }

  refreshMfData: Subject<any> = new Subject();
  refreshEqData: Subject<any> = new Subject();

  showLoadSpinner() {
    this.spinner.show();
  }

  hideLoadSpinner() {
    this.spinner.hide();
  }

  public get appToken(): string {
    return this.getCookie('app-token');
  }

  public set appToken(appToken: string) {
    this.setCookie("app-token", appToken, 2);
  }

  public get appUserId(): number {
    return parseInt(this.getCookie('app-user-id'));
  }

  public set appUserId(v: number) {
    this.setCookie("app-user-id", v, 2);
  }

  setCookie(name: string, value: any, days: number) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  getCookie(name: string) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return "";
  }

  eraseCookie(name: string) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  getSessionStorageData(key: string) {
    return sessionStorage.getItem(key);
  }

  setSessionStorageData(key: string, value: string) {
    return sessionStorage.setItem(key, value);
  }

  removeSessionStorageData(key: string) {
    return sessionStorage.removeItem(key);
  }

  removeAlert() {
    const alertBoxElem = document.querySelector('.show-alert') as HTMLElement;
    if (alertBoxElem != null) {
      alertBoxElem.style.display = 'none';
      const alertElem = alertBoxElem.querySelector('div') as HTMLElement;
      if (alertElem != null) {
        alertElem.innerHTML = '';
      }
    }
  }

  showAlert(msg: string | object, type = 'danger', actionTxt?: string, timeoutDuration = AppConstants.SNACKBAR_CLOSE_TIMEOUT_DURATION) {
    if (actionTxt == undefined || actionTxt == null) {
      actionTxt = "Close";
    }
    if (typeof msg !== 'string') {
      msg = "An error occurred -> " + JSON.stringify(msg);
    }
    this.snackBar.open(msg, actionTxt);
    const alertBoxElem = document.querySelector('.show-alert') as HTMLElement;
    alertBoxElem.innerHTML = '<div class="show fade alert alert-dismissible" role="alert">    <span>A simple danger alert—check it out!</span>    <button type="button" class="btn-close" data-dismiss="alert" aria-label="Close"></button></div>';
    const alertElem = alertBoxElem.querySelector('div') as HTMLElement;
    alertElem.classList.remove('alert-success');
    alertElem.classList.remove('alert-danger');
    alertElem.classList.remove('alert-warning');
    alertElem.classList.add('alert-' + type);
    (alertElem.querySelector('span') as HTMLElement).innerHTML = msg;
    alertElem.style.display = 'block';
    setTimeout(() => {
      this.snackBar.dismiss();
    }, timeoutDuration);
  }

  roundUpAmount(amount: string | number, digitCount?: number) {
    if (typeof amount == 'string') {
      amount = Number(amount);
    }
    let _dCount = digitCount;
    if (_dCount === undefined || _dCount === null) {
      _dCount = 2;
    }
    return amount.toFixed(_dCount);
  }

  roundUpAmt(amount: string | number, digitCount = 2) {
    return Number(this.roundUpAmount(amount, digitCount));
  }

  formatAmountWithComma(amount: string | number): string {
    if (typeof amount == 'number') {
      amount = amount.toString();
    }
    amount = amount.replace(/\.+/g, '.');
    var amountVal = amount.split(".");
    var formattedAmount = Math.abs(parseInt(amountVal[0]));
    var isNegative = parseInt(amountVal[0]) < 0 ? "-" : "";
    var formattedAmountText = formattedAmount.toLocaleString();
    if (amountVal.length > 1) {
      return isNegative + AppConstants.RUPEE_SYMBOL + formattedAmountText + "." + amountVal[1].substr(0, 2);
    } else {
      return isNegative + AppConstants.RUPEE_SYMBOL + formattedAmountText + ".00";
    }
  }

  getClassVal(value: any) {
    return value.indexOf("-") != -1 ? 'negative-val' : 'positive-val'
  }

  formatDate(val: string): string {
    let _temp = val.split("-");
    if (_temp[2].length == 4) {
      return _temp[0] + "-" + this.getMonthName(_temp[1]) + "-" + _temp[2];
    }
    return _temp[2] + "-" + this.getMonthName(_temp[1]) + "-" + _temp[0];
  }

  getMonthName(val: string): string {
    return AppConstants.MONTH[parseInt(val)];
  }

  formatStringValueToAmount(amt: string | undefined): number {
    if (amt === undefined) {
      return 0;
    }
    let arr = amt.split(AppConstants.RUPEE_SYMBOL);
    return parseFloat(arr[0] + (arr[1]).replace(/,/g, ""));
  }

  getDate(_currDate?: string): string {
    let _cDate: Date;
    if (_currDate === undefined || _currDate === null) {
      _cDate = new Date();
    } else {
      _cDate = new Date(_currDate);
    }
    return _cDate.getFullYear() + "-" + this.padLeadingZero(_cDate.getMonth() + 1) + "-" + this.padLeadingZero(_cDate.getDate());
  }

  padLeadingZero(s: any) {
    return (s < 10) ? '0' + s : s;
  }

  convertEmailDate(_dateStr: string): string {
    var __parts = _dateStr.split(" ");
    let _time = __parts[1];
    let _date = __parts[0];
    let __date_parts = _date.split("-");
    if (_time != undefined) {
      return [__date_parts[0], this.getMonthName(parseInt(__date_parts[1]).toString()), __date_parts[2]].join('-') + ' ' + _time;
    } else {
      return [__date_parts[0], this.getMonthName(parseInt(__date_parts[1]).toString()), __date_parts[2]].join('-')
    }
  }

  convertDate(_date?: any) {
    var d = new Date();
    if (_date !== undefined && _date !== null) {
      d = new Date(_date);
    }
    return [this.padLeadingZero(d.getDate()), this.padLeadingZero(d.getMonth() + 1), d.getFullYear()].join('-')
  }

  getFullDate(day: number, month?: number) {
    let d = new Date();
    if (month === undefined) {
      month = d.getMonth() + 1;
    }
    return [this.padLeadingZero(day), this.padLeadingZero(month), d.getFullYear()].join('-');
  }

  calculateDateDiff(date1: string | Date, date2?: string | Date) {
    let currentDate = new Date();
    if (date2 !== undefined) {
      if (typeof date2 === 'string') {
        date2 = new Date(date2);
      }
      currentDate = date2;
    }
    if (typeof date1 === 'string') {
      date1 = new Date(date1);
    }

    return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())) / (1000 * 60 * 60 * 24));
  }

  calculateMfInvestedAmount(transAmt: number, transDate: string | Date) {
    try {
      if (typeof transDate === 'string') {
        transDate = new Date(transDate);
      }
      let cutOffDt: Date = new Date('2020-07-01');
      if (transDate >= cutOffDt) {
        return 0.99995 * transAmt;
      } else {
        return transAmt;
      }
    } catch (e: any) {
      this.showAlert(e);
      return transAmt;
    }
  }

  validationJsonString(data: string): boolean {
    let chkResult = false;
    if (data == undefined || data == null || data.trim() == "") {
      chkResult = true;
    } else {
      try {
        JSON.parse(data);
        chkResult = true;
      } catch (_e) { }
    }
    return chkResult;
  }

  isMobile(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }
}
