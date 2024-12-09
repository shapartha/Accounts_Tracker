import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiConstants } from 'app/const/api.constants';
import { Observable } from 'rxjs';
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

  getCategory(apiFuncParams: any): Observable<any> {
    const apiFuncName = ApiConstants.API_GET_CATEGORY;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getAccountsByCategory(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_ACCOUNTS_BY_CATEGORY;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getAllTransactions(apiFuncParams: any) {
      const apiFuncName = ApiConstants.API_GET_ALL_TRANS;
      return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  appendMandatoryParams(): string {
    let _apiJsonParams = "&apiKey=" + ApiConstants.API_KEY;
    _apiJsonParams += "&apiToken=" + this.utilService.appToken;
    return _apiJsonParams;
  }

  invokeApiCall(apiFuncName: any, apiFuncParams: any, appendParams = true, serverUrl = ApiConstants.SERVER_URL) {
    return this.http.get<any>(serverUrl + "?apiFunctionName=" + encodeURIComponent(apiFuncName) + "&apiFunctionParams=" + encodeURIComponent(JSON.stringify(apiFuncParams)) + (appendParams == true ? this.appendMandatoryParams() : ''));
  }
}
