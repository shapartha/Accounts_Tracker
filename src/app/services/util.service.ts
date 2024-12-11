import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from 'app/const/app.constants';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private snackBar: MatSnackBar) { }

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
    alertBoxElem.style.display = 'none';
    const alertElem = alertBoxElem.querySelector('div') as HTMLElement;
    alertElem.innerHTML = '';
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

  roundUpAmt(amount: string | number) {
    return Number(this.roundUpAmount(amount));
  }

  formatAmountWithComma(amount: string | number): string {
    if (typeof amount == 'number') {
      amount = amount.toString();
    }
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
}
