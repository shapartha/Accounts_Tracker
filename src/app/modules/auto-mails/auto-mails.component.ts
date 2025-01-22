import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiConstants } from 'app/const/api.constants';
import { Account } from 'app/models/account';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-auto-mails',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auto-mails.component.html',
  styleUrl: './auto-mails.component.scss'
})
export class AutoMailsComponent implements OnInit {

  signedIn: boolean = false;
  mail_trans_cat: any[] = [];
  accounts: Account[] = [];

  constructor(private apiService: ApiService, public utilService: UtilService) { }

  ngOnInit(): void {
    this.apiService.checkGoogleSigninStatus().subscribe({
      next: data => {
        if (data.success == true) {
          this.signedIn = true;
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
    this.apiService.getAllAccounts({ user_id: this.utilService.appUserId }).subscribe({
      next: accData => {
        if (accData && accData.dataArray) {
          accData.dataArray.forEach((element: any) => {
            element['id'] = element.account_id;
            element['name'] = element.account_name;
          });
          this.accounts = accData.dataArray;
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  signOut() {
    this.apiService.googleSignout().subscribe({
      next: data => {
        if (data.success == true) {
          this.signedIn = false;
        } else {
          this.utilService.showAlert(data.responseDescription);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  readGoogle() {
    let callingUrl = 'http://shapartha.online/google-apis/readEmails.php?db_apiKey=' + ApiConstants.API_KEY + '&db_apiToken=' + this.utilService.appToken + '&_callbackUrl=' + encodeURIComponent(window.location.origin + window.location.pathname);
    if (this.signedIn) {
      this.apiService.readGmailTransactions(callingUrl).subscribe({
        next: data => {
          this.mail_trans_cat = data;
          this.mail_trans_cat.forEach(element => {
            element.accName = this.accounts.find(acc => Number(acc.id) == Number(element.accId))?.name;
          });
          console.log(this.mail_trans_cat);
        }, error: err => {
          this.utilService.showAlert(err);
        }
      });
    } else {
      window.location.href = callingUrl;
    }
  }
}
