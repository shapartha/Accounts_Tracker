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
    let callingUrl = ApiConstants.API_GOOGLE_AUTH_URL + '?db_apiKey=' + ApiConstants.API_KEY + '&db_apiToken=' + this.utilService.appToken + '&_callbackUrl=' + encodeURIComponent(window.location.origin + window.location.pathname.replace('email_transactions', 'callback'));
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
            element.data.forEach((itm: any) => {
              if (isNaN(new Date(itm.trans_date).getTime())) {
                let _dte = itm.trans_date.split("-") || itm.trans_date.split("/");
                itm.trans_date = _dte[2] + "-" + _dte[1] + "-" + _dte[0];
              }
              itm.trans_date = this.utilService.formatDate(this.utilService.getDate(itm.trans_date));
            });
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
    _inpObj.amount = _inpObj.amount.replace(/\.+/g, '.');
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

  deleteItem(evt: any) {
    this.selectedRecord = evt;
    this.modalTitle = "Delete this mail condition - " + this.selectedRecord.value.filter + " ?";
    this.modalBody = "You're about to remove this mail filter condition. Are you sure you want to delete this ?";
    this.modalBtnName = 'Delete';
    this.confirmData = {
      type: 'DELETE-MAIL-FILTER',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  deleteItemConfirmed(evt: any) {
    let data = evt.value;
    let _inpObj = {
      filter: data.filter
    };
    this.apiService.getMailFilterMappingByFilter(_inpObj).subscribe({
      next: (apiResp: any) => {
        let id = apiResp.dataArray[0].mapping_id;
        this.apiService.deleteMailFilterMapping([{ mapping_id: id }]).subscribe({
          next: (resp: any) => {
            if (resp[0].success == true && resp[0].response == '200') {
              this.utilService.showAlert('Mail Filter deleted successfully', 'success');
              this.canClose = true;
              this.mail_trans_cat.splice(this.mail_trans_cat.findIndex(pObj => pObj.filter == this.selectedRecord.value.filter && pObj.accId == this.selectedRecord.value.accId), 1);
            } else {
              this.utilService.showAlert('An error occurred deleting this mail filter');
            }
          }, error: (err) => {
            console.error(err);
            this.utilService.showAlert(err);
          }
        });
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
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
    } else if (evt.type == 'DELETE-MAIL-FILTER' && evt.value == true) {
      this.deleteItemConfirmed(this.selectedRecord);
    } else if (evt.type == 'CLEAN-UP' && evt.value == true) {
      this.cleanUpConfirmed();
    }
  }

  cleanUp() {
    this.modalTitle = "Clean Up Old Records ?";
    this.modalBody = "This will clean up all old processed messages from each filters. Some already processed messages may re-appear. In such cases, reject the repeat items. Are you sure to continue ?";
    this.modalBtnName = 'Clean Up';
    this.confirmData = {
      type: 'CLEAN-UP',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  cleanUpConfirmed() {
    let alertMessages = [];
    let _updObjs = [];
    this.apiService.getAllMailFilterMappings().subscribe({
      next: (apiCallData: any) => {
        if (apiCallData.success == true && apiCallData.response == '200') {
          this.canClose = true;
          let accFilterMappings = apiCallData.dataArray;
          for (var i = 0; i < accFilterMappings.length; i++) {
            let __filter = accFilterMappings[i];
            let lastMsgIds = __filter.last_msg_id;
            let lastMsgIdArr = lastMsgIds.split(",");
            if (lastMsgIdArr.length > 100) {
              let newMsgIdArr = lastMsgIdArr.slice(50);
              let newMsgIds = newMsgIdArr.join(",");
              let _updObj = {
                mapping_id: __filter.mapping_id,
                filter: __filter.filter,
                last_msg_id: newMsgIds
              };
              _updObjs.push(_updObj);
            } else {
              alertMessages.push("Nothing to clean-up for filter - " + __filter.filter);
            }
          }
          if (_updObjs.length > 0) {
            this.apiService.updateMailFilterMapping(_updObjs).subscribe({
              next: (apiCallUpdate: any) => {
                for (var x = 0; x < apiCallUpdate.length; x++) {
                  if (apiCallUpdate[x].success == true) {
                    alertMessages.push("Messages Cleaned-Up Successfully for filter - " + _updObjs[x].filter);
                  } else {
                    alertMessages.push("An error occurred cleaning-up the messages in DB for filter - " + _updObjs[x].filter);
                  }
                }
                if (alertMessages.length > 0) {
                  this.utilService.showAlert(alertMessages.join(" , "), 'warning');
                }
              }, error: err => {
                this.utilService.showAlert(err);
              }
            });
          } else {
            if (alertMessages.length > 0) {
              this.utilService.showAlert(alertMessages.join(" , "), 'warning');
            }
          }
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  getAmountClass(amt: string) {
    if (amt.toUpperCase() == 'DEBIT') {
      return 'negative-val';
    } else if (amt.toUpperCase() == 'CREDIT') {
      return 'positive-val';
    }
    return '';
  }
}
