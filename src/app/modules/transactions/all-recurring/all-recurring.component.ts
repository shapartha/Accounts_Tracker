import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-all-recurring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-recurring.component.html',
  styleUrl: './all-recurring.component.scss'
})
export class AllRecurringComponent {

  constructor(public apiService: ApiService, public utilService: UtilService) { }

  recurring_trans: any = [];

  ngOnInit(): void {
    this.fetchAllScheduledTransactions();
  }

  fetchAllScheduledTransactions() {
    this.apiService.getAllRecurringTrans({ user_id: this.utilService.appUserId }).subscribe({
      next: (getAllRecurTransResp) => {
        if (getAllRecurTransResp.success === true) {
          if (getAllRecurTransResp.response !== '200') {
            return;
          }
          getAllRecurTransResp.dataArray.forEach((obj: any) => {
            let _itm = {
              rec_trans_id: obj.rec_trans_id,
              rec_trans_desc: obj.rec_trans_desc,
              rec_trans_date: obj.rec_trans_date,
              rec_trans_amount: this.utilService.formatAmountWithComma(obj.rec_trans_amount),
              is_paused: obj.is_paused,
              account_id: obj.account_id,
              account_name: obj.account_name,
              balance: obj.balance,
              category_id: obj.category_id,
              rec_trans_type: obj.rec_trans_type,
              is_equity: obj.is_equity,
              is_mf: obj.is_mf,
              rec_trans_executed: obj.rec_trans_executed,
              rec_trans_last_executed_date: this.utilService.formatDate(obj.rec_trans_last_executed),
              rec_mf_scheme_code: obj.rec_mf_scheme_name,
              rec_mf_scheme_name: obj.scheme_name,
              tooltipDisabled: true
            };
            this.recurring_trans.push(_itm);
          });
        } else {
          this.utilService.showAlert("Error Response: " + JSON.stringify(getAllRecurTransResp));
        }
      },
      error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  getClassVal(value: any) {
    let _type = value.rec_trans_type;
    return _type.toUpperCase().indexOf("DEBIT") != -1 ? 'negative-val' : 'positive-val';
  }
}
