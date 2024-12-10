import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiConstants } from 'app/const/api.constants';
import { AppConstants } from 'app/const/app.constants';
import { Account } from 'app/models/account';
import { Transaction } from 'app/models/transaction';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-all-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-transactions.component.html',
  styleUrl: './all-transactions.component.scss'
})
export class AllTransactionsComponent implements OnInit {
  inputAccountData: any;
  inputSearchObj: any;
  transactions: Transaction[] = [];
  totalTransactions: number = 0;
  transactionStartOffset: number = 0;
  transactionEndOffset: number = AppConstants.FETCH_RECORDS_COUNT;
  apiFuncName = '';
  noOfRecordsFetched: number = 0;
  disableNext: boolean = false;
  disablePrev: boolean = false;
  totalRecords: number = 0;
  inputParams: any;
  transactionHeader: string = 'All Transactions';
  pageLoaded = false;

  constructor(private route: ActivatedRoute, private utilService: UtilService, private apiService: ApiService) {
    this.route.queryParams.subscribe({
      next: (params) => {
        if (params['text'] != null) {
          history.replaceState(params, '');
          this.inputSearchObj = params;
          if (this.pageLoaded == true) {
            this.totalTransactions = 0;
            this.transactionStartOffset = 0;
            this.transactionEndOffset = AppConstants.FETCH_RECORDS_COUNT;
            this.ngOnInit();
          }
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    })
  }

  ngOnInit(): void {
    this.pageLoaded = true;
    if (history.state != null) {
      this.inputAccountData = history.state as Account;
    } else {
      this.inputAccountData = {} as Account;
    }
    this.inputParams = {
      user_id: this.utilService.appUserId,
      limit: this.transactionStartOffset + ", " + this.transactionEndOffset
    };
    if (this.inputAccountData != null && this.inputAccountData.id != null) {
      this.apiFuncName = ApiConstants.API_GET_TRANS_BY_ACCOUNT;
      this.inputParams.account_id = this.inputAccountData.id;
      this.transactionHeader = this.inputAccountData.name + " - Transactions";
    } else if (this.inputSearchObj != null && this.inputSearchObj.user_id != null) {
      this.apiFuncName = ApiConstants.API_SEARCH_TRANSACTION;
      this.inputParams.text = this.inputSearchObj.text;
      this.transactionHeader = "Transactions containing text - " + this.inputSearchObj.text;
    } else {
      this.apiFuncName = ApiConstants.API_GET_ALL_TRANS;
    }
    history.replaceState({}, '');
    this.disablePrev = true;
    if (this.apiFuncName == '') {
      this.disableNext = true;
      this.transactionStartOffset = -1;
      this.noOfRecordsFetched = 1;
      return;
    }
    this.fetchTransactions(this.inputParams, this.apiFuncName);
  }

  next() {
    if (this.noOfRecordsFetched < AppConstants.FETCH_RECORDS_COUNT) {
      this.transactionStartOffset += this.noOfRecordsFetched;
    } else {
      this.transactionStartOffset += this.transactionEndOffset;
    }
    this.inputParams.limit = this.transactionStartOffset + ", " + this.transactionEndOffset;
    this.fetchTransactions(this.inputParams, this.apiFuncName);
  }

  prev() {
    this.transactionStartOffset -= this.transactionEndOffset;
    if (this.transactionStartOffset <= 0) {
      this.transactionStartOffset = 0;
      this.disablePrev = true;
    }
    this.inputParams.limit = this.transactionStartOffset + ", " + this.transactionEndOffset;
    this.fetchTransactions(this.inputParams, this.apiFuncName);
  }

  getMoneyVal(value: any, existingClass: string, negativeClass: string, positiveClass: string) {
    let _type = value.transType;
    let classListValue = existingClass;
    classListValue += _type.toUpperCase().indexOf("DEBIT") != -1 ? negativeClass : positiveClass;
    return classListValue;
  }

  fetchTransactions(inputParams: any, apiName: string) {
    this.apiService.getTransactions(inputParams, apiName).subscribe({
      next: (trans) => {
        this.transactions = [];
        if (trans.dataArray === undefined) {
          return;
        }
        this.noOfRecordsFetched = 0;
        trans.dataArray!.forEach((item: any) => {
          let _trans: Transaction = {} as any;
          _trans.id = item.trans_id;
          _trans.description = item.trans_desc;
          _trans.transType = item.trans_type;
          _trans.amount = this.utilService.formatAmountWithComma((Math.round(item.trans_amount! * 100) / 100).toFixed(2));
          _trans.date = this.utilService.formatDate(item.trans_date);
          _trans.acc_name = item.account_name;
          _trans.is_mf = item.is_mf;
          _trans.is_equity = item.is_equity;
          _trans.is_delivery_order = item.is_delivery_order;
          _trans.is_delivered = item.is_delivered;
          _trans.acc_id = item.account_id;
          _trans.acc_name = item.account_name;
          _trans.cat_id = item.category_id;
          _trans.user_id = item.user_id;
          _trans.acc_balance = item.balance;
          _trans.receiptImgId = item.trans_receipt_image_id;
          this.transactions.push(_trans);
          this.noOfRecordsFetched++;
        });
        if (this.noOfRecordsFetched < AppConstants.FETCH_RECORDS_COUNT) {
          this.disableNext = true;
        } else {
          this.disableNext = false;
        }
        if (this.noOfRecordsFetched > 0) {
          this.totalRecords = Number(trans.dataArray[0].NUM_REC);
          this.disablePrev = false;
          if (this.transactionStartOffset - this.transactionEndOffset < 0) {
            this.disablePrev = true;
          }
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }
}
