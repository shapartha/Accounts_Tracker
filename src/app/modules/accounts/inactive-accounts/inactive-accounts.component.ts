import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-inactive-accounts',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './inactive-accounts.component.html',
  styleUrl: './inactive-accounts.component.scss'
})
export class InactiveAccountsComponent implements OnInit {

  constructor(private apiService: ApiService, private utilService: UtilService) { }

  inactive_accounts: any = [];

  ngOnInit(): void {
    this.fetchInactiveAccounts();
  }

  fetchInactiveAccounts() {
    this.apiService.getInactiveAccounts({ user_id: this.utilService.appUserId }).subscribe({
      next: (resp) => {
        this.inactive_accounts = [];
        if (resp.success === true) {
          if (resp.response !== '200') {
            return;
          }
          resp.dataArray.forEach((obj: any) => {
            let _itm = {
              account_id: obj.account_id,
              account_name: obj.account_name,
              balance: this.utilService.formatAmountWithComma(obj.balance),
              is_active: obj.is_active
            };
            this.inactive_accounts.push(_itm);
          });
        }
      }
    });
  }

  activateAccount(account: any) {
    let _acc = account;
    _acc.is_active = 'Y';
    this.apiService.updateAccount([_acc]).subscribe({
      next: (resp: any) => {
        if (resp[0].success === true) {
          this.utilService.showAlert('Account activated successfully', 'success');
          this.fetchInactiveAccounts();
        } else {
          this.utilService.showAlert("Some Error occurred activating the account");
        }
      }
    });
  }
}
