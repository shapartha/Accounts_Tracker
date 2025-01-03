import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { Account } from 'app/models/account';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { XIRRService } from 'app/services/xirr.service';
import { RedeemMfComponent } from "../../../modals/redeem-mf/redeem-mf.component";

@Component({
  selector: 'app-mfdashboard',
  standalone: true,
  imports: [ContextMenuModule, CommonModule, RedeemMfComponent],
  templateUrl: './mfdashboard.component.html',
  styleUrl: './mfdashboard.component.scss'
})
export class MfDashboardComponent implements OnInit {

  @Input() accountDetails: Account = {};
  mfMappings: any[] = [];
  overallXirr: number = 0.00;
  dialogTitle = '';
  modalRef: any;
  selectedMfScheme: any;
  modifiedRecord: any = {};

  constructor(public utilService: UtilService, private apiService: ApiService, private xirrService: XIRRService, private modalService: NgbModal) { }

  ngOnInit(): void {
    if (this.accountDetails.id == null) {
      this.utilService.showAlert("Account Details not found or unavailable");
      return;
    } else {
      this.populateDashboard();
    }
  }

  getMoneyVal(value: any, existingClass: string, negativeClass: string, positiveClass: string) {
    let currAmt = this.utilService.formatStringValueToAmount(value.curr_amt);
    let invAmt = value.inv_amt;
    let classListValue = existingClass;
    if (invAmt > currAmt) {
      classListValue += negativeClass;
    } else {
      classListValue += positiveClass;
    }
    return classListValue;
  }

  populateDashboard() {
    this.mfMappings = [];
    let _inpObj_ = {
      account_id: this.accountDetails.id,
      user_id: this.utilService.appUserId
    }
    this.apiService.getMfSchemesByAccount(_inpObj_).subscribe({
      next: (resp: any) => {
        if (resp.success === true) {
          if (resp.response !== '200') {
            return;
          }
          resp.dataArray.forEach((element: any) => {
            let _item = {
              account_id: element.account_id,
              account_data: this.accountDetails,
              avg_nav: element.avg_nav,
              inv_amt: element.inv_amt,
              nav_amt: element.nav_amt,
              nav_date: element.nav_date,
              scheme_code: element.scheme_code,
              scheme_name: element.scheme_name,
              units: element.units,
              user_id: element.user_id,
              curr_amt: '0',
              xirr_val: 0,
              abs_return: 0
            };
            _item.curr_amt = this.utilService.formatAmountWithComma((_item.units * _item.nav_amt).toString());
            _item.nav_date = this.utilService.formatDate(_item.nav_date);
            this.mfMappings.push(_item);
          });
          this.populateXIRR();
        } else {
          this.utilService.showAlert(resp);
        }
      }, error: (err: any) => {
        this.utilService.showAlert(err);
      }
    });
  }

  populateXIRR() {
    this.mfMappings.forEach(element => {
      let _inpObj_ = {
        scheme_code: element.scheme_code,
        account_id: element.account_id
      };
      this.apiService.getMfTransByAccSchemeAsc(_inpObj_).subscribe({
        next: (mfTransAscResp: any) => {
          if (mfTransAscResp.success === true) {
            if (mfTransAscResp.response !== '200') {
              return;
            }
            let _payments: number[] = [];
            let _days: Date[] = [];
            mfTransAscResp.dataArray.forEach((itm: any) => {
              if (itm.trans_type.toUpperCase() === 'CREDIT') {
                _payments.push(0 - itm.amount);
              } else {
                _payments.push(Number(this.utilService.roundUpAmount(itm.amount)));
              }
              _days.push(new Date(itm.trans_date));
            });
            _payments.push(Number(this.utilService.roundUpAmount(element.nav_amt * element.units)));
            _days.push(new Date(element.nav_date));

            let xirrVal = this.xirrService.getXirrVal(0.1, _payments, _days);
            if (isNaN(xirrVal) || !isFinite(xirrVal)) {
              xirrVal = 0.00;
            } else {
              xirrVal = Number(this.utilService.roundUpAmount(xirrVal * 100));
            }
            element.xirr_val = xirrVal;
          } else {
            this.utilService.showAlert(mfTransAscResp);
          }
          let _absYearlyReturn: number = 0;
          _absYearlyReturn = this.utilService.roundUpAmt(((this.utilService.formatStringValueToAmount(element.curr_amt) - element.inv_amt) / element.inv_amt) * 100);
          element.abs_return = _absYearlyReturn;
        }, error: (err: any) => {
          this.utilService.showAlert(err);
        }
      });
    });
    let _accInpObj_ = {
      account_id: this.accountDetails.id,
      user_id: this.utilService.appUserId
    }
    this.apiService.getMfTransByAcc(_accInpObj_).subscribe({
      next: (mfTransResp: any) => {
        if (mfTransResp.success === true) {
          if (mfTransResp.response !== '200') {
            return;
          }
          let _payments: number[] = [];
          let _days: Date[] = [];
          mfTransResp.dataArray.forEach((itm: any) => {
            if (itm.trans_type.toUpperCase() === 'CREDIT') {
              _payments.push(0 - itm.amount);
            } else {
              _payments.push(Number(this.utilService.roundUpAmount(itm.amount)));
            }
            _days.push(new Date(itm.trans_date));
          });
          _payments.push(Number(this.utilService.formatStringValueToAmount(this.accountDetails.balance).toFixed(2)));
          _days.push(new Date());
          let xirrVal = this.xirrService.getXirrVal(0.1, _payments, _days);
          if (isNaN(xirrVal) || !isFinite(xirrVal)) {
            xirrVal = 0.00;
          } else {
            xirrVal = Number(this.utilService.roundUpAmount(xirrVal * 100));
          }
          this.overallXirr = xirrVal;
        } else {
          this.utilService.showAlert(mfTransResp);
        }
      }, error: (err: any) => {
        this.utilService.showAlert(err);
      }
    });
  }

  redeem(content: TemplateRef<any>, evt: any, isFullRedemption = true) {
    let data = evt.value;
    this.selectedMfScheme = data;
    data['redeemType'] = (isFullRedemption) ? 'Fully' : 'Partially';
    this.dialogTitle = 'Redeem "' + data.scheme_name + '" ' + data.redeemType + ' ?';
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

  updatedRecord(event: any) {
    this.modifiedRecord = this.selectedMfScheme;
    this.modifiedRecord.newAmount = event.rdmAmt;
    this.modifiedRecord.newNav = event.rdmNav;
    this.modifiedRecord.newTransDate = this.utilService.convertDate(event.rdmDte);
    this.modifiedRecord.newUnits = event.rdmUnits;
    this.modifiedRecord.is_valid = event.valid;
  }

  confirmRedeem(item: any) {
    if (item.is_valid == false) {
      this.utilService.showAlert('One or more form fields are invalid');
    } else {
      if (item.newAmount > this.utilService.formatStringValueToAmount(item.curr_amt)) {
        this.utilService.showAlert("You can redeem only upto the current fund value");
        return;
      }
      let _transObj_ = {
        trans_desc: "Redeemed " + this.utilService.formatAmountWithComma(item.newAmount.toFixed(2)) + " from " + item.scheme_name,
        trans_date: item.newTransDate,
        trans_amount: item.newAmount.toFixed(2),
        trans_type: "DEBIT",
        account_id: item.account_id,
        user_id: this.utilService.appUserId.toString()
      };
      this.apiService.saveTransactionOnly([_transObj_]).subscribe({
        next: (transResp: any) => {
          if (transResp[0].success === true) {
            let _accObj_ = {
              account_id: item.account_id,
              account_name: item.account_data.name,
              category_id: item.account_data.category_id,
              user_id: this.utilService.appUserId,
              balance: this.utilService.formatStringValueToAmount(item.account_data.balance) - item.newAmount
            };
            this.apiService.updateAccount([_accObj_]).subscribe({
              next: (accResp: any) => {
                if (accResp[0].success === true) {
                  let _mfTransObj_ = {
                    scheme_code: item.scheme_code,
                    account_id: item.account_id,
                    trans_date: item.newTransDate,
                    units: item.newUnits,
                    nav: item.newNav,
                    amount: item.newAmount,
                    trans_type: 'DEBIT',
                    balance_units: 0.00
                  };
                  this.apiService.saveMfTrans([_mfTransObj_]).subscribe({
                    next: (mfTrans: any) => {
                      let _inpObj_ = {
                        account_id: item.account_id,
                        scheme_code: item.scheme_code,
                        user_id: this.utilService.appUserId
                      };
                      let _balUnits = 0.0, _invAmt = 0.0;
                      let _redeemedUnits = _mfTransObj_.units;
                      let _toUpdateMfTrans: any[] = [];
                      this.apiService.getMfTransByAccScheme(_inpObj_).subscribe({
                        next: (getMfTransResp: any) => {
                          for (var x = 0; x < getMfTransResp.dataArray.length; x++) {
                            let _b = getMfTransResp.dataArray[x];
                            let _avlBalanceUnits = _b.balance_units;
                            if (_avlBalanceUnits >= _redeemedUnits) {
                              _avlBalanceUnits -= _redeemedUnits;
                              _redeemedUnits = 0;
                            } else {
                              _redeemedUnits -= _avlBalanceUnits;
                              _avlBalanceUnits = 0;
                            }
                            _b.balance_units = _avlBalanceUnits;
                            _toUpdateMfTrans.push(_b);
                            if (_redeemedUnits == 0) {
                              break;
                            }
                          }
                          this.apiService.updateMfTrans(_toUpdateMfTrans).subscribe({
                            next: (updMfTransResp: any) => {
                              if (mfTrans[0].success === true && getMfTransResp.success === true && updMfTransResp[0].success === true) {
                                if (item.redeemType == 'Partially') {
                                  this.apiService.getMfTransByAccScheme(_inpObj_).subscribe({
                                    next: (getMfTransResp: any) => {
                                      getMfTransResp.dataArray.forEach((_a: any) => {
                                        _balUnits += this.utilService.roundUpAmt(_a.balance_units);
                                        _invAmt += this.utilService.roundUpAmt(_a.balance_units * _a.nav);
                                      });
                                      let _updMfMapObj_ = {
                                        scheme_name: item.scheme_name,
                                        nav_amt: item.newNav,
                                        units: _balUnits,
                                        inv_amt: _invAmt,
                                        nav_date: item.newTransDate,
                                        avg_nav: Number((_invAmt / _balUnits).toFixed(4)),
                                        account_id: item.account_id,
                                        scheme_code: item.scheme_code
                                      };
                                      this.apiService.updateMfMapping([_updMfMapObj_]).subscribe({
                                        next: (updMfMapResp: any) => {
                                          if (updMfMapResp[0].success === true) {
                                            this.modalRef.close('Save clicked');
                                            this.utilService.showAlert("Partial Redemption Successful", 'success');
                                            this.populateDashboard();
                                          } else {
                                            this.utilService.showAlert(updMfMapResp[0]);
                                          }
                                        }, error: (err: any) => {
                                          this.utilService.showAlert(err);
                                        }
                                      });
                                    }, error: (err: any) => {
                                      this.utilService.showAlert(err);
                                    }
                                  });
                                } else {
                                  let _deleteObj_ = {
                                    account_id: item.account_id,
                                    scheme_code: item.scheme_code
                                  };
                                  this.apiService.deleteMfMapping([_deleteObj_]).subscribe({
                                    next: (deleteMfMapResp: any) => {
                                      if (deleteMfMapResp[0].success === true) {
                                        this.modalRef.close('Save clicked');
                                        this.utilService.showAlert("Full Redemption Successful");
                                        this.populateDashboard();
                                      } else {
                                        this.utilService.showAlert(deleteMfMapResp[0]);
                                      }
                                    }, error: (err: any) => {
                                      this.utilService.showAlert(err);
                                    }
                                  });
                                }
                              } else {
                                this.utilService.showAlert(mfTrans[0]);
                              }
                            }, error: (err: any) => {
                              this.utilService.showAlert(err);
                            }
                          });
                        }, error: (err: any) => {
                          this.utilService.showAlert(err);
                        }
                      });
                    }, error: (err: any) => {
                      this.utilService.showAlert(err);
                    }
                  });
                } else {
                  this.utilService.showAlert(accResp[0]);
                }
              }, error: (err: any) => {
                this.utilService.showAlert(err);
              }
            });
          } else {
            this.utilService.showAlert(transResp[0]);
          }
        }, error: (err: any) => {
          this.utilService.showAlert(err);
        }
      });
    }
  }
}
