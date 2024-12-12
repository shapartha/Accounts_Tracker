import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-all-scheduled',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-scheduled.component.html',
  styleUrl: './all-scheduled.component.scss'
})
export class AllScheduledComponent {
  constructor(public apiService: ApiService, public utilService: UtilService) { }

  scheduled_trans: any = [];

  ngOnInit(): void {
    this.fetchAllScheduledTransactions();
  }

  fetchAllScheduledTransactions() {
    this.apiService.getAllScheduledTrans({ user_id: this.utilService.appUserId }).subscribe({
      next: (resp) => {
        this.scheduled_trans = [];
        if (resp.success === true) {
          if (resp.response !== '200') {
            return;
          }
          resp.dataArray.forEach((obj: any) => {
            let _itm = {
              trans_id: obj.trans_id,
              trans_desc: obj.trans_desc,
              trans_date: this.utilService.formatDate(obj.trans_date),
              trans_amount: this.utilService.formatAmountWithComma(obj.trans_amount),
              account_id: obj.account_id,
              account_name: obj.account_name,
              trans_receipt_image_id: obj.trans_receipt_image_id,
              trans_type: obj.trans_type,
              is_equity: obj.is_equity,
              is_mf: obj.is_mf,
              mf_nav: obj.mf_nav,
              nav_amt: obj.nav_amt,
              nav_date: obj.nav_date,
              scheme_code: obj.scheme_code,
              scheme_name: obj.scheme_name,
              units: obj.units,
              avg_nav: obj.avg_nav,
              rec_date: null
            };
            if (obj.rec_date != null && obj.rec_date != undefined && obj.rec_date != "") {
              _itm.rec_date = obj.rec_date;
            }
            this.scheduled_trans.push(_itm);
          });
        } else {
          this.utilService.showAlert("Error occurred to fetch records: " + JSON.stringify(resp));
        }
      },
      error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  getClassVal(value: any) {
    let _type = value.trans_type;
    return _type.toUpperCase().indexOf("DEBIT") != -1 ? 'negative-val' : 'positive-val';
  }
}
