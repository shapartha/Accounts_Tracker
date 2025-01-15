import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ConfirmData } from 'app/models/confirm';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { firstValueFrom } from 'rxjs';
import { UpdateMfTransComponent } from "../../../modals/update-mf-trans/update-mf-trans.component";

@Component({
  selector: 'app-mftransactions',
  standalone: true,
  imports: [ContextMenuModule, CommonModule, UpdateMfTransComponent],
  templateUrl: './mftransactions.component.html',
  styleUrl: './mftransactions.component.scss'
})
export class MfTransactionsComponent implements OnInit, OnChanges {

  @Input() mfAccount = {} as any;
  mfTransRecords: any[] = [];
  selectedRecord: any;
  @Output() confirmObject = new EventEmitter<any>();
  @Input() deleteClicked: boolean = false;
  transactionsModified: boolean = false;
  selectedMfScheme: any;
  modifiedRecord: any = {};
  modalRef: any;

  constructor(public utilService: UtilService, private apiService: ApiService, private modalService: NgbModal) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['deleteClicked']?.isFirstChange() && changes['deleteClicked']?.currentValue == true) {
      this.deleteMfTransaction(this.selectedRecord);
    }
  }

  ngOnInit(): void {
    this.loadMfTransactions();
  }

  loadMfTransactions() {
    this.apiService.getMfTransByAccSchemeAsc(this.mfAccount).subscribe({
      next: mfTrans => {
        this.mfTransRecords = [];
        mfTrans.dataArray.forEach((element: any) => {
          this.mfTransRecords.push(element);
        });
      }
    });
  }

  getMoneyVal(value: any, existingClass: string, negativeClass: string, positiveClass: string) {
    let transType = value.trans_type;
    let classListValue = existingClass;
    if (transType == 'DEBIT') {
      classListValue += negativeClass;
    } else {
      classListValue += positiveClass;
    }
    return classListValue;
  }

  getMoneyValue(value: any, existingClass: string, negativeClass: string, positiveClass: string) {
    if (this.utilService.formatStringValueToAmount(value.curr_amt) <= value.inv_amt) {
      value.trans_type = 'DEBIT';
    } else {
      value.trans_type = 'CREDIT';
    }
    return this.getMoneyVal(value, existingClass, negativeClass, positiveClass);
  }

  update(content: TemplateRef<any>, evt: any) {
    let data = evt.value;
    this.selectedMfScheme = data;
    this.modalRef = this.modalService.open(content,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        fullscreen: 'md',
        scrollable: true,
        size: 'lg'
      });
  }

  delete(evt: any) {
    this.selectedRecord = evt.value;
    let modalTitle = "Delete this MF Transaction ?";
    let modalBody = "You're about to DELETE this mutual fund transaction. Do you want to continue ?";
    let modalBtnName = 'Delete';
    let confirmData: ConfirmData = {
      type: 'DELETE-MF-TRANS',
      value: false
    };
    let canClose = false;
    this.confirmObject.emit({
      modalTitle: modalTitle,
      modalBody: modalBody,
      modalBtnName: modalBtnName,
      canClose: canClose,
      confirmData: confirmData,
      record: this.selectedRecord
    });
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  deleteMfTransaction(data: any) {
    if (Number(data.balance_units) >= Number(this.mfAccount.units) && data.trans_type == 'CREDIT') {
      this.utilService.showAlert('This will remove ALL the units from this Mutual Fund. To continue, please go back and "REDEEM ALL" units');
      this.confirmObject.emit({
        canClose: true,
      });
      return;
    } else if (Number(data.balance_units) <= 0 && data.trans_type == 'CREDIT') {
      this.utilService.showAlert('Deletion Blocked !! There are NO Balance Units available to delete the transaction');
      this.confirmObject.emit({
        canClose: true,
      });
      return;
    }
    let mfMappingInput: any;
    let mfTransUpdInput = [];
    if (data.trans_type == 'CREDIT') {
      mfMappingInput = {
        account_id: this.mfAccount.account_id,
        scheme_code: this.mfAccount.scheme_code,
        units: this.utilService.roundUpAmount((Number(this.mfAccount.units) - Number(data.balance_units)), 4),
        inv_amt: this.utilService.roundUpAmount(Number(this.mfAccount.inv_amt) - (Number(data.balance_units) * Number(data.nav))),
        avg_nav: '0.0'
      };
      mfMappingInput.avg_nav = this.utilService.roundUpAmount(Number(mfMappingInput.inv_amt) / Number(mfMappingInput.units), 4);
    } else {
      let restoredUnits = Number(data.units);
      for (var i = (this.mfTransRecords.length - 1); i >= 0; i--) {
        if (this.mfTransRecords[i].trans_type == 'DEBIT') {
          continue;
        }
        if (restoredUnits <= 0) {
          break;
        }
        let diffUnits = Number(this.mfTransRecords[i].units) - Number(this.mfTransRecords[i].balance_units);
        if (diffUnits > 0) {
          this.mfTransRecords[i].balance_units = this.utilService.roundUpAmount(Number(this.mfTransRecords[i].balance_units) + diffUnits, 4);
          restoredUnits = this.utilService.roundUpAmt(restoredUnits - diffUnits);
          mfTransUpdInput.push({
            trans_id: this.mfTransRecords[i].trans_id,
            balance_units: this.mfTransRecords[i].balance_units
          });
        } else {
          continue;
        }
      }
      mfMappingInput = {
        account_id: this.mfAccount.account_id,
        scheme_code: this.mfAccount.scheme_code,
        units: this.utilService.roundUpAmount((Number(this.mfAccount.units) + Number(data.units)), 4),
        inv_amt: this.utilService.roundUpAmount(Number(this.mfAccount.inv_amt) + (Number(data.units) * Number(data.nav))),
        avg_nav: '0.0'
      };
      mfMappingInput.avg_nav = this.utilService.roundUpAmount(Number(mfMappingInput.inv_amt) / Number(mfMappingInput.units), 4);
    }
    this.apiService.deleteMfTrans([{ trans_id: data.trans_id }]).subscribe({
      next: async (resp: any) => {
        if (resp[0].success == true) {
          if (data.trans_type == 'DEBIT') {
            const updMfTransResp: any = await firstValueFrom(this.apiService.updateMfTrans(mfTransUpdInput));
            if (updMfTransResp[0].success == true) { } else {
              this.utilService.showAlert('MF Transaction deletion failed while updating other transactions');
              this.confirmObject.emit({
                canClose: true,
              });
              return;
            }
          }
          this.apiService.updateMfMapping([mfMappingInput]).subscribe({
            next: (updMfMapResp: any) => {
              if (updMfMapResp[0].success == true) {
                this.transactionsModified = true;
                this.utilService.showAlert('MF Transaction deleted successfully', 'success');
                this.confirmObject.emit({
                  canClose: true,
                });
                this.mfAccount.units = mfMappingInput.units;
                this.mfAccount.inv_amt = mfMappingInput.inv_amt;
                this.mfAccount.avg_nav = mfMappingInput.avg_nav;
                this.loadMfTransactions();
              } else {
                this.utilService.showAlert(updMfMapResp);
              }
            }, error: err => {
              this.utilService.showAlert(err);
            }
          });
        } else {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  updatedRecord(event: any) {
    this.modifiedRecord = this.selectedMfScheme;
    this.modifiedRecord.newDate = this.utilService.convertDate(event.transDate);
    this.modifiedRecord.newNav = event.nav;
    this.modifiedRecord.newBalanceUnits = event.balanceUnits;
    this.modifiedRecord.newUnits = event.units;
    this.modifiedRecord.is_valid = event.valid;
  }

  confirmUpdate(item: any) {
    if (item.is_valid == false) {
      this.utilService.showAlert('One or more form fields are invalid');
    } else {
      let mfTransUpdInputs = {
        trans_id: item.trans_id,
        trans_type: item.trans_type,
        balance_units: item.newBalanceUnits,
        units: item.newUnits,
        trans_date: item.newDate,
        nav: item.newNav
      };
      this.apiService.updateMfTrans([mfTransUpdInputs]).subscribe({
        next: (updResp: any) => {
          if (updResp[0].success == true) {
            let unitDiff = this.utilService.roundUpAmt(item.newBalanceUnits, 4) - this.utilService.roundUpAmt(item.balance_units);
            if (this.utilService.roundUpAmt(unitDiff, 1) != 0) {
              let mfMappingInput = {
                account_id: this.mfAccount.account_id,
                scheme_code: this.mfAccount.scheme_code,
                units: this.utilService.roundUpAmount((Number(this.mfAccount.units) + unitDiff), 4),
                avg_nav: '0.0'
              };
              mfMappingInput.avg_nav = this.utilService.roundUpAmount(Number(this.mfAccount.inv_amt) / Number(mfMappingInput.units), 4);
              this.apiService.updateMfMapping([mfMappingInput]).subscribe({
                next: (updMfMapResp: any) => {
                  if (updMfMapResp[0].success == true) {
                    this.transactionsModified = true;
                    this.utilService.showAlert('MF Transaction updated successfully', 'success');
                    this.modalRef.close('Submitted');
                    this.mfAccount.units = mfMappingInput.units;
                    this.mfAccount.avg_nav = mfMappingInput.avg_nav;
                    this.loadMfTransactions();
                  } else {
                    this.utilService.showAlert(updMfMapResp);
                  }
                }, error: err => {
                  this.utilService.showAlert(err);
                }
              });
            }
          } else {
            this.utilService.showAlert(updResp);
          }
        }, error: err => {
          this.utilService.showAlert(err);
        }
      });
    }
  }
}
