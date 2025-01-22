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

  getToken(apiFuncParams: any = {}): Observable<any> {
    const apiFuncName = ApiConstants.API_GET_TOKEN;
    return this.invokeApiCall(apiFuncName, apiFuncParams, false);
  }

  loginUser(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_USER_LOGIN;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getCategory(apiFuncParams: any = {}): Observable<any> {
    const apiFuncName = ApiConstants.API_GET_CATEGORY;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getAllAccounts(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_ALL_ACCOUNTS;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getAccountsByCategory(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_ACCOUNTS_BY_CATEGORY;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getAccountsByName(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_ACCOUNTS_BY_NAME;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getAccountById(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_ACCOUNT_BY_ID;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getTransactions(apiFuncParams: any = {}, apiName: string) {
    return this.invokeApiCall(apiName, apiFuncParams);
  }

  getMfSchemesByAccount(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_MF_SCHEMES_BY_ACCOUNT;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  uploadReceiptImage(apiFuncParams: any = {}): Observable<any> {
    const apiFuncName = ApiConstants.API_UPLOAD_RECEIPT;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  saveTransaction(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_SAVE_TRANSACTION;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  saveTransactionOnly(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_SAVE_TRANSACTION_ONLY;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getRecurringTransToday(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_TODAY_RECUR_TRANS;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getScheduledTransToday(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_TODAY_SCHEDULE_TRANS;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  /**
  * 
  * @param apiFuncParams ops_mode : 1 - PROCESS, 2 - DELETE, 3 - POSTPONE
  */
  processScheduledTrans(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_PROCESS_SCHEDULED_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getAllScheduledTrans(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_ALL_SCHEDULED_TRANS;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getAllRecurringTrans(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_ALL_RECUR_TRANS;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  completeRecurTrans(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_COMPLETE_RECUR_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateRecTrans(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_RECUR_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  deleteRecTrans(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_DELETE_RECUR_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  deleteTransaction(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_DELETE_TRANSACTION;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  deleteAccount(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_DELETE_ACCOUNT;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  deleteCategory(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_DELETE_CATEGORY;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  saveAccount(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_SAVE_ACCOUNT;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateAccount(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_ACCOUNT;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  saveCategory(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_SAVE_CATEGORY;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateCategory(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_CATEGORY;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateTransaction(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_TRANSACTION;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateScheduledTrans(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_SCHEDULED_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getReceiptImage(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_RECEIPT;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateBillDueDate(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_BILL_DUE_DATE;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getAllMutualFunds(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_ALL_MF;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getMfSchemesByAccountScheme(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_MF_SCHEMES_BY_ACCOUNT_SCHEME;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  saveMfMapping(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_SAVE_MF_MAPPING;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateMfMapping(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_MF_MAPPING;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  saveMfTrans(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_SAVE_MF_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getAllStocks(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_ALL_STOCKS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  saveStockMapping(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_SAVE_STOCK_MAPPING;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateStockMapping(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_STOCK_MAPPING;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getAllMailFilterMappings(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_ALL_MAIL_FILTER_MAPPING;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getMailFilterMappingByFilter(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_MAIL_FILTER_MAPPING_BY_FILTER;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getMailFilterMappingByAccId(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_MAIL_FILTER_MAPPING_BY_ACC;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  saveMailFilterMapping(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_SAVE_MAIL_FILTER_MAPPING;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateMailFilterMapping(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_MAIL_FILTER_MAPPING;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  deleteMailFilterMapping(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_DELETE_MAIL_FILTER_MAPPING;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getDeliveryTrans(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_DELIVERY_TRANS;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  saveMutualFund(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_SAVE_MF;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateMutualFund(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_MF;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  deleteMutualFund(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_DELETE_MF;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  saveStock(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_SAVE_STOCK;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  updateStock(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_STOCK;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  deleteStock(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_DELETE_STOCK;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getMfTransByAccSchemeAsc(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_GET_MF_TRANS_BY_ACC_SCHEME_ASC;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getMfTransByAccScheme(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_MF_TRANS_BY_ACC_SCHEME;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getMfTransByAcc(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_MF_TRANS_BY_ACC;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  updateMfTrans(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_UPDATE_MF_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  deleteMfTrans(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_DELETE_MF_TRANS;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  deleteMfMapping(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_DELETE_MF_MAPPING;
    return this.postApiCall(apiFuncName, apiFuncParams);
  }

  getEqMappingByAccount(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_STOCK_MAPPING_BY_ACC;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getEqMappingByAccountSymbol(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_STOCK_MAPPING_BY_ACC_SYM;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  getAllEqMappingsByAccountSymbol(apiFuncParams: any) {
    const apiFuncName = ApiConstants.API_GET_ALL_STOCK_MAPPINGS_BY_ACC_SYM;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  invokeMfStockUpdater(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_MF_STOCKS_UPDATER;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  invokeMonthlyRoutines(apiFuncParams: any = {}) {
    const apiFuncName = ApiConstants.API_MONTHLY_ROUTINES;
    return this.invokeApiCall(apiFuncName, apiFuncParams);
  }

  fetchMfCode(schemeName: any) {
    const apiFuncName = ApiConstants.API_GET_DELIVERY_TRANS;
    return this.http.get<any>(ApiConstants.API_FETCH_MF_CODE + schemeName);
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

  fetchMfNav(schemeCode: any) {
    const serverUrl = ApiConstants.API_FETCH_MF_NAV + schemeCode;
    return this.invokeApiCall('', '', false, serverUrl);
  }

  fetchStockCMP(stockSymbol: any) {
    const serverUrl = ApiConstants.API_FETCH_STOCK_CMP + stockSymbol;
    return this.invokeApiCall('', '', false, serverUrl);
  }

  checkGoogleSigninStatus() {
    const apiFuncName = ApiConstants.API_GOOGLE_SIGNIN_CHECK;
    return this.invokeApiCall(apiFuncName, {});
  }

  googleSignout() {
    const apiFuncName = ApiConstants.API_GOOGLE_SIGNOUT;
    return this.invokeApiCall(apiFuncName, {});
  }

  readGmailTransactions(urlToInvoke: string) {
    return this.http.get<any>(urlToInvoke);
  }
}
