import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ConfirmData } from 'app/models/confirm';
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { AddUpdateTransactionComponent } from '../add-update-transaction/add-update-transaction.component';

@Component({
  selector: 'app-all-scheduled',
  standalone: true,
  imports: [CommonModule, ContextMenuModule, ConfirmDialogComponent, AddUpdateTransactionComponent],
  templateUrl: './all-scheduled.component.html',
  styleUrl: './all-scheduled.component.scss'
})
export class AllScheduledComponent {

  constructor(public apiService: ApiService, public utilService: UtilService, private modalService: NgbModal) { }

  scheduled_trans: any = [];
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

  delete(e: any) {
    this.selectedRecord = e.value;
    this.modalTitle = "Delete " + this.selectedRecord.trans_desc;
    this.modalBody = "You are about to delete this scheduled transaction. Do you want to continue ?";
    this.confirmData = {
      type: 'DELETE',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  confirm(evt: ConfirmData) {
    if (evt.type == 'DELETE' && evt.value == true) {
      let _inpObj_ = {
        trans_id: this.selectedRecord.trans_id,
        ops_mode: 2
      };
      this.apiService.processScheduledTrans(_inpObj_).subscribe({
        next: (data: any) => {
          if (data.success === true) {
            this.utilService.showAlert("Scheduled Transaction : " + this.selectedRecord.trans_desc + " deleted successfully", 'success');
            this.canClose = true;
            this.fetchAllScheduledTransactions();
          } else {
            this.utilService.showAlert("An error occurred | " + data.response + ":" + data.responseDescription);
          }
        }, error: (err) => {
          console.error(err);
          this.utilService.showAlert(err);
        }
      });
    }
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

  updatedRecord(event: any) {
    this.modifiedRecord.trans_id = event.id;
    this.modifiedRecord.trans_amount = this.utilService.roundUpAmount(event.amount);
    this.modifiedRecord.trans_desc = event.description;
    this.modifiedRecord.trans_date = this.utilService.convertDate(event.transDate);
    this.modifiedRecord.account_id = event.fromAccDetails;
    this.modifiedRecord.rec_date = event.reccDate;
    this.modifiedRecord.isRecc = event.isRecurringTrans;
    this.modifiedRecord.scheme_code = event.mfSchemeCode;
    this.modifiedRecord.mf_nav = event.mfNav;
    this.modifiedRecord.user_id = this.utilService.appUserId;
    this.modifiedRecord.isValid = event.valid;
  }

  saveOrUpdate(item: any) {
    if (item.isValid == true) {
      if (item.trans_desc == undefined || item.trans_desc?.length! < 3) {
        this.utilService.showAlert("Description must be atleast 3 characters");
        return;
      }
      if (item.trans_date == undefined || item.trans_date == null) {
        this.utilService.showAlert("Date is invalid or blank.");
        return;
      }
      if (item.trans_amount == undefined || item.trans_amount == null) {
        this.utilService.showAlert("Amount is invalid or blank.");
        return;
      }
      if (item.account_id == undefined || item.account_id == null) {
        this.utilService.showAlert("Account is invalid or not selected.");
        return;
      }
      if (item.isRecc == true && (item.rec_date == undefined || item.rec_date == null)) {
        this.utilService.showAlert("Recurring Date is invalid or not selected.");
        return;
      }
      this.apiService.updateScheduledTrans([item]).subscribe({
        next: (resp: any) => {
          if (resp[0].success === true) {
            this.utilService.showAlert("Scheduled Transaction updated successfully", 'success');
            this.modalRef.close('Save clicked');
            this.fetchAllScheduledTransactions();
          }
        }, error: (err) => {
          console.error(err);
          this.utilService.showAlert(err);
        }
      });
    } else {
      this.utilService.showAlert('One or more form fields are invalid');
    }
  }
}
