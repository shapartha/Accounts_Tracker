import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Account } from 'app/models/account';
import { Transaction } from 'app/models/transaction';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-all-transactions',
  standalone: true,
  imports: [],
  templateUrl: './all-transactions.component.html',
  styleUrl: './all-transactions.component.scss'
})
export class AllTransactionsComponent implements OnInit {
  inputAccountData: any;
  transactions: Transaction[] = [];

  constructor(private router: Router, private utilService: UtilService, private apiService: ApiService) {
    if (this.router.getCurrentNavigation() != null) {
      this.inputAccountData = this.router.getCurrentNavigation()!.extras.state as Account;
    } else {
      this.inputAccountData = {} as Account;
    }
  }

  ngOnInit(): void {
    let inputParams = {
      user_id: this.utilService.appUserId
    };
    this.apiService.getAllTransactions(inputParams).subscribe({
      next: (trans) => {
        if (trans.dataArray === undefined) {
          this.transactions = [];
          return;
        }
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
        });
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }
}
