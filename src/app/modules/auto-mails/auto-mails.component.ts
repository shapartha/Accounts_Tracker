import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ApiConstants } from 'app/const/api.constants';
import { Account } from 'app/models/account';
import { ConfirmData } from 'app/models/confirm';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { ConfirmDialogComponent } from '../modals/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-auto-mails',
  standalone: true,
  imports: [CommonModule, ContextMenuModule, ConfirmDialogComponent],
  templateUrl: './auto-mails.component.html',
  styleUrl: './auto-mails.component.scss'
})
export class AutoMailsComponent implements OnInit {

  signedIn: boolean = false;
  mail_trans_cat: any[] = [];
  accounts: Account[] = [];

  selectedRecord: any;
  canClose: boolean = false;
  modalTitle: string = '';
  modalBody: string = '';
  confirmData: ConfirmData = {} as any;
  modalBtnName: string = '';

  constructor(private apiService: ApiService, public utilService: UtilService) { }

  ngOnInit(): void {
    this.apiService.checkGoogleSigninStatus().subscribe({
      next: data => {
        if (data.success == true) {
          this.signedIn = true;
          this.readGoogle();
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
          this.mail_trans_cat = [];
        } else {
          this.utilService.showAlert(data.responseDescription);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  readGoogle() {
    let callingUrl = 'http://shapartha.online/google-apis/readEmails.php?db_apiKey=' + ApiConstants.API_KEY + '&db_apiToken=' + this.utilService.appToken + '&_callbackUrl=' + encodeURIComponent(window.location.origin + window.location.pathname.replace('email_transactions', 'callback'));
    if (this.signedIn) {
      let inputs = {
        db_apiKey: ApiConstants.API_KEY,
        db_apiToken: this.utilService.appToken,
        _callbackUrl: window.location.origin + window.location.pathname,
        gapiSigned: this.signedIn
      };
      this.apiService.readGmailTransactions(inputs).subscribe({
        next: data => {
          this.mail_trans_cat = JSON.parse(data);
          this.mail_trans_cat.forEach(element => {
            element.accName = this.accounts.find(acc => Number(acc.id) == Number(element.accId))?.name;
          });
        }, error: err => {
          this.utilService.showAlert(err);
        }
      });
    } else {
      this.utilService.setCookie('redir-link', callingUrl, (1 / 24 / 60));
      var myWindow = window.open(window.location.origin + window.location.pathname.replace('email_transactions', 'callback'), 'callbackWindow', 'popup');
      var timer = setInterval(function () {
        if (myWindow?.closed) {
          clearInterval(timer);
          window.location.reload();
        }
      }, 1000);
    }
  }

  acceptItem(evt: any) {
    this.selectedRecord = evt;
    this.modalTitle = "Accept this transaction - " + this.selectedRecord.value.trans.trans_desc + " ?";
    this.modalBody = "You're about to add this as a new transaction. Are you sure you want to accept this transaction ?";
    this.modalBtnName = 'Accept';
    this.confirmData = {
      type: 'ACCEPT-TRANS',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  acceptItemConfirmed(evt: any) {
    let item = evt.value;
    let _accId = item.acc.accId;
    let _inpObj = {
      amount: item.trans.trans_amt.replace(",", ""),
      date: this.utilService.convertDate(item.trans.trans_date.split(" ")[0]),
      desc: item.trans.trans_desc,
      type: item.trans.trans_type,
      acc_id: _accId,
      user_id: this.utilService.appUserId
    };
    this.apiService.saveTransaction(_inpObj).subscribe({
      next: (resp: any) => {
        if (resp.success === true) {
          this.utilService.showAlert("Saved Successfully", 'success');
          this.markMsgProcessed(item);
          this.canClose = true;
        } else {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  rejectItem(evt: any) {
    this.selectedRecord = evt;
    this.modalTitle = "Reject this transaction - " + this.selectedRecord.value.trans.trans_desc + " ?";
    this.modalBody = "You're about to remove this from the gmail transaction logs. Are you sure you want to reject this transaction ?";
    this.modalBtnName = 'Reject';
    this.confirmData = {
      type: 'REJECT-TRANS',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  rejectItemConfirmed(evt: any) {
    this.markMsgProcessed(evt.value);
    this.canClose = true;
  }

  markMsgProcessed(item: any) {
    let _inpObj = {
      filter: item.trans.google_filter,
      acc_id: item.acc.accId
    };
    this.apiService.getMailFilterMappingByAccId(_inpObj).subscribe({
      next: (apiCallData: any) => {
        if (apiCallData.success == true) {
          if (apiCallData.response == '200') {
            let lastMsgId = apiCallData.dataArray[0].last_msg_id;
            if (lastMsgId == null || lastMsgId == undefined || lastMsgId == '') {
              lastMsgId = item.trans.google_msg_id;
            } else {
              lastMsgId += "," + item.trans.google_msg_id;
            }
            let _updObj = {
              mapping_id: apiCallData.dataArray[0].mapping_id,
              last_msg_id: lastMsgId
            };
            this.apiService.updateMailFilterMapping([_updObj]).subscribe({
              next: (apiCallUpdate: any) => {
                if (apiCallUpdate[0].success == true) {
                  this.utilService.showAlert("Message Processed Successfully", 'success');
                  let _parentObj = this.mail_trans_cat.find((pObj: any) => pObj.filter == _inpObj.filter && pObj.accId == _inpObj.acc_id);
                  let _childObj = _parentObj.data.findIndex((cObj: any) => _updObj.last_msg_id.indexOf(cObj.google_msg_id) != -1);
                  _parentObj.data.splice(_childObj, 1);
                } else {
                  this.utilService.showAlert("An error occurred processing the message in DB");
                }
              }, error: err => {
                this.utilService.showAlert(err);
              }
            });
          } else {
            this.utilService.showAlert(apiCallData);
          }
        } else {
          this.utilService.showAlert(apiCallData);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  confirm(evt: ConfirmData) {
    if (evt.type == 'ACCEPT-TRANS' && evt.value == true) {
      this.acceptItemConfirmed(this.selectedRecord);
    } else if (evt.type == 'REJECT-TRANS' && evt.value == true) {
      this.rejectItemConfirmed(this.selectedRecord);
    }
  }
}
