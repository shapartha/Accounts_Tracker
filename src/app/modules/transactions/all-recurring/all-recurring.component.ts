import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ConfirmData } from 'app/models/confirm';
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';
import { UpdateRecurringComponent } from 'app/modules/modals/update-recurring/update-recurring.component';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-all-recurring',
  standalone: true,
  imports: [CommonModule, ContextMenuModule, UpdateRecurringComponent, ConfirmDialogComponent],
  templateUrl: './all-recurring.component.html',
  styleUrl: './all-recurring.component.scss'
})
export class AllRecurringComponent {

  constructor(public apiService: ApiService, public utilService: UtilService, private modalService: NgbModal) { }

  recurring_trans: any = [];
  @Output() refreshParent: EventEmitter<any> = new EventEmitter();
  updateTrans: any;
  modalRef: any;
  modifiedRecord: any = {};
  canClose: boolean = false;
  modalTitle: string = '';
  modalBody: string = '';
  confirmData: ConfirmData = {} as any;
  selectedRecord: any;

  ngOnInit(): void {
    this.fetchAllScheduledTransactions();
  }

  fetchAllScheduledTransactions() {
    this.recurring_trans = [];
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
              rec_trans_last_executed: this.utilService.formatDate(obj.rec_trans_last_executed),
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

  showPause(value: any) {
    return value['is_paused'] == '0';
  }

  showResume(value: any) {
    return value['is_paused'] == '1';
  }

  updateRecurringTransaction(data: any) {
    this.apiService.updateRecTrans([data]).subscribe({
      next: (updRecTransResp: any) => {
        if (updRecTransResp[0].success === true) {
          this.utilService.showAlert("Recurring Transaction updated successfully.", 'success');
          this.modalRef.close('Save clicked');
          this.fetchAllScheduledTransactions();
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  saveOrUpdate(item: any) {
    item.rec_trans_executed = (item.rec_trans_executed == true) ? 'true' : 'false';
    this.updateRecurringTransaction(item);
  }

  updatedRecord(event: any) {
    this.modifiedRecord.rec_trans_id = event.id;
    this.modifiedRecord.rec_trans_amount = this.utilService.roundUpAmount(event.amount);
    this.modifiedRecord.rec_trans_desc = event.description;
    this.modifiedRecord.rec_trans_last_executed = this.utilService.convertDate(event.transDate);
    this.modifiedRecord.rec_account_id = event.accountId;
    this.modifiedRecord.rec_trans_date = event.reccDate;
    this.modifiedRecord.rec_trans_executed = event.hasExecuted;
    this.modifiedRecord.rec_mf_scheme_name = event.mfSchemeCode;
    this.modifiedRecord.user_id = this.utilService.appUserId;
  }

  update(content: TemplateRef<any>, data: any) {
    this.updateTrans = data.value;
    this.modalRef = this.modalService.open(content,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        fullscreen: 'md',
        scrollable: true,
        size: 'lg'
      });
    this.modalRef.result.then(
      (result: any) => {
        console.log("Update - " + result);
      },
      (_reason: any) => { },
    );
  }

  delete(e: any) {
    this.selectedRecord = e.value;
    this.modalTitle = "Delete " + this.selectedRecord.rec_trans_desc;
    this.modalBody = "You are about to delete this recurring transaction. Do you want to continue ?";
    this.confirmData = {
      type: 'DELETE',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  pause(e: any) {
    let data = e.value;
    let _updTrans = {
      rec_trans_id: data.rec_trans_id,
      is_paused: (data.is_paused === '1') ? "false" : "true"
    };
    this.apiService.updateRecTrans([_updTrans]).subscribe({
      next: (updRecTransResp: any) => {
        if (updRecTransResp[0].success === true) {
          this.fetchAllScheduledTransactions();
          this.utilService.showAlert("Recurring Transaction " + (data.is_paused == "1" ? "resumed" : "paused") + " successfully.", 'success');
        } else {
          this.utilService.showAlert("An error occurred -> " + JSON.stringify(updRecTransResp));
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  resume(e: any) {
    this.pause(e);
  }

  confirm(evt: ConfirmData) {
    if (evt.type == 'DELETE' && evt.value == true) {
      let _inpObj_ = {
        rec_trans_id: this.selectedRecord.rec_trans_id
      };
      this.apiService.deleteRecTrans([_inpObj_]).subscribe({
        next: (deleteRecTransResp: any) => {
          if (deleteRecTransResp[0].success === true) {
            this.utilService.showAlert("Recurring Transaction : " + this.selectedRecord.rec_trans_desc + " deleted successfully", 'success');
            this.canClose = true;
            this.fetchAllScheduledTransactions();
          } else {
            this.utilService.showAlert("An error occurred | " + deleteRecTransResp[0].response + ":" + deleteRecTransResp[0].responseDescription);
          }
        }, error: (err) => {
          console.error(err);
          this.utilService.showAlert(err);
        }
      });
    }
  }
}
