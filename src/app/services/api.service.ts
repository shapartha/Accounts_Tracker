import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiConstants } from 'app/const/api.constants';
import { Observable, of } from 'rxjs';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private router: Router, private utilService: UtilService) {
    if (this.utilService.appToken == "") {
      this.invokeTokenCall();
    }
  }

  invokeTokenCall() {
    let inputParams = {
      api_key: ApiConstants.API_KEY
    };
    this.getToken(inputParams).subscribe(data => {
      if (data.success) {
        this.utilService.appToken = data.dataArray.token;
      }
    });
  }

  getToken(apiFuncParams: any): Observable<any> {
    const apiFuncName = ApiConstants.API_GET_TOKEN;
    return this.invokeApiCall(apiFuncName, apiFuncParams, false);
  }

  loginUser(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_USER_LOGIN;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getCategory(apiFuncParams: any): Observable<any> {
    const apiFuncName = ApiConstants.API_GET_CATEGORY;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getAllAccounts(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_ALL_ACCOUNTS;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getAccountsByCategory(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_ACCOUNTS_BY_CATEGORY;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getTransactions(apiFuncParams: any, apiName: string) {
    return this.invokeApiCall(apiName, apiFuncParams);
  }

  getMfSchemesByAccount(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_MF_SCHEMES_BY_ACCOUNT;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  uploadReceiptImage(apiFuncParams: any): Observable<any> {
    const apiFuncName = ApiConstants.API_UPLOAD_RECEIPT;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  saveTransaction(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_SAVE_TRANSACTION;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getRecurringTransToday(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_TODAY_RECUR_TRANS;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getScheduledTransToday(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_TODAY_SCHEDULE_TRANS;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  /**
  * 
  * @param apiFuncParams ops_mode : 1 - PROCESS, 2 - DELETE, 3 - POSTPONE
  */
  processScheduledTrans(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_PROCESS_SCHEDULED_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getAllScheduledTrans(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_ALL_SCHEDULED_TRANS;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getAllRecurringTrans(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_ALL_RECUR_TRANS;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  completeRecurTrans(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_COMPLETE_RECUR_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateRecTrans(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_UPDATE_RECUR_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  deleteRecTrans(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_DELETE_RECUR_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  deleteTransaction(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_DELETE_TRANSACTION;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateAccount(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_UPDATE_ACCOUNT;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateTransaction(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_UPDATE_TRANSACTION;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getReceiptImage(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_RECEIPT;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  appendMandatoryParams(): string {
    let _apiJsonParams = "&apiKey=" + ApiConstants.API_KEY;
    _apiJsonParams += "&apiToken=" + this.utilService.appToken;
    return _apiJsonParams;
  }

  invokeApiCall(apiFuncName: any, apiFuncParams: any, appendParams = true, serverUrl = ApiConstants.SERVER_URL) {
    return this.http.get<any>(serverUrl + "?apiFunctionName=" + encodeURIComponent(apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + (appendParams == true ? this.appendMandatoryParams() : ''));
  }

  postApiCall(apiFuncName: any, apiFuncParams: any, appendParams = true, serverUrl = ApiConstants.SERVER_URL) {
    const headers = {
      'content-type': 'application/x-www-form-urlencoded',
      'accept': 'application/json'
    };
    return this.http.post(serverUrl, "apiFunctionName=" + encodeURIComponent(apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + (appendParams == true ? this.appendMandatoryParams() : ''),
      { 'headers': headers });
  }
}
