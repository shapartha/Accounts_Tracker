import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { Account } from 'app/models/account';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { XIRRService } from 'app/services/xirr.service';
import { firstValueFrom } from 'rxjs';
import { RedeemEqComponent } from "../../../modals/redeem-eq/redeem-eq.component";

@Component({
  selector: 'app-eqdashboard',
  standalone: true,
  imports: [ContextMenuModule, CommonModule, RedeemEqComponent],
  templateUrl: './eqdashboard.component.html',
  styleUrl: './eqdashboard.component.scss'
})
export class EqDashboardComponent implements OnInit {

  @Input() accountDetails: Account = {};
  @Output() changedAccountDetails: EventEmitter<Account> = new EventEmitter();
  @Output() selectedData: EventEmitter<any> = new EventEmitter();
  eqMappings: any[] = [];
  selectedEqScheme: any;
  dialogTitle: string = '';
  modalRef: any;
  modifiedRecord: any = {};

  constructor(public utilService: UtilService, private apiService: ApiService, private xirrService: XIRRService, private modalService: NgbModal) { }

  ngOnInit(): void {
    if (this.accountDetails.id == null) {
      this.utilService.showAlert("Account Details not found or unavailable");
      return;
    } else {
      this.populateDashboard();
    }

    this.utilService.refreshEqData.asObservable().subscribe(val => {
      if (val == true) {
        this.refreshEqData();
      }
    })
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
    this.eqMappings = [];
    let _inpObj_ = {
      account_id: this.accountDetails.id,
      user_id: this.utilService.appUserId
    }
    this.apiService.getEqMappingByAccount(_inpObj_).subscribe({
      next: (resp: any) => {
        if (resp.success === true) {
          if (resp.response !== '200') {
            return;
          }
          resp.dataArray.forEach((element: any) => {
            let _item = {
              account_id: element.account_id,
              account_data: this.accountDetails,
              avg_price: this.utilService.formatAmountWithComma(element.avg_price),
              inv_amt: this.utilService.formatAmountWithComma(element.inv_amt),
              current_market_price: this.utilService.formatAmountWithComma(element.current_market_price),
              purchase_date: this.utilService.formatDate(element.purchase_date),
              stock_symbol: element.stock_symbol,
              stock_name: element.stock_name,
              no_of_shares: element.no_of_shares,
              user_id: element.user_id,
              curr_amt: '0',
              ann_return: 0,
              abs_return: 0
            };
            _item.curr_amt = this.utilService.formatAmountWithComma((_item.no_of_shares * element.current_market_price).toString());
            _item.abs_return = this.utilService.roundUpAmt((((_item.no_of_shares * element.current_market_price) / element.inv_amt) - 1) * 100);
            let _daydiff_ = this.utilService.calculateDateDiff(element.purchase_date);
            _item.ann_return = this.utilService.roundUpAmt((((_item.no_of_shares * element.current_market_price) - element.inv_amt) * 100) / (element.inv_amt * (_daydiff_ / 365)));
            this.eqMappings.push(_item);
          });
          this.refreshEqData('CMP_ONLY');
        } else {
          this.utilService.showAlert(resp);
        }
      }, error: (err: any) => {
        this.utilService.showAlert(err);
      }
    });
  }

  refreshEqData(mode: any = null) {
    this.utilService.refreshEqData.next(false);
    if (this.eqMappings.length <= 0) {
      this.utilService.showAlert("No Stocks are mapped with this account");
    }
    let investmentValuation = 0;
    var counter = 0;
    this.eqMappings.forEach(element => {
      this.apiService.fetchStockCMP(element.stock_symbol).subscribe({
        next: (resp: any) => {
          var _mappedEq_ = this.eqMappings.filter(eqMap => eqMap.stock_symbol === element.stock_symbol)[0];
          _mappedEq_.current_market_price = this.utilService.formatAmountWithComma(this.utilService.roundUpAmount(resp.data.pricecurrent));
          _mappedEq_.curr_amt = this.utilService.formatAmountWithComma((_mappedEq_.no_of_shares * resp.data.pricecurrent).toString());
          _mappedEq_.abs_return = this.utilService.roundUpAmt((((_mappedEq_.no_of_shares * resp.data.pricecurrent) / this.utilService.formatStringValueToAmount(_mappedEq_.inv_amt)) - 1) * 100);
          let _daydiff_ = this.utilService.calculateDateDiff(_mappedEq_.purchase_date);
          _mappedEq_.ann_return = this.utilService.roundUpAmt((((_mappedEq_.no_of_shares * resp.data.pricecurrent) - this.utilService.formatStringValueToAmount(_mappedEq_.inv_amt)) * 100) / (this.utilService.formatStringValueToAmount(_mappedEq_.inv_amt) * (_daydiff_ / 365)));
          investmentValuation += this.utilService.formatStringValueToAmount(_mappedEq_.curr_amt);
          counter++;
          if (counter === this.eqMappings.length) {
            if (mode != 'CMP_ONLY') {
              this.updateEqMapping(investmentValuation, resp.data.lastupd);
            }
          }
        }, error: (err: any) => {
          this.utilService.showAlert(err);
        }
      });
    });
  }

  validateEqMappingResponse(data: any) {
    let _resp = true;
    data.forEach((element: any) => {
      if (element.response !== '200' && !!_resp) {
        _resp = false;
      }
    });
    return _resp;
  }

  async updateEqMapping(investmentValuation: number, lastUpdate: string) {
    let _updObj_: any[] = [];
    this.eqMappings.forEach(element => {
      let _indObj_ = {
        current_market_price: this.utilService.formatStringValueToAmount(element.current_market_price),
        last_market_date: this.utilService.convertDate(lastUpdate.split(" ")[0]),
        stock_symbol: element.stock_symbol
      }
      _updObj_.push(_indObj_);
    });
    let investmentChange = Number(this.utilService.roundUpAmount(investmentValuation - this.utilService.formatStringValueToAmount(this.accountDetails.balance)));
    if (investmentChange != 0) {
      const apiResp = await firstValueFrom(this.apiService.updateStock(_updObj_));
      if (this.validateEqMappingResponse(apiResp)) {
        let _acc = {
          account_id: this.accountDetails.id,
          balance: this.utilService.roundUpAmt(investmentValuation),
          user_id: this.utilService.appUserId
        };
        this.apiService.updateAccount([_acc]).subscribe({
          next: (accApiRespData: any) => {
            if (accApiRespData[0].success === true) {
              let accDets = {} as Account;
              Object.assign(accDets, this.accountDetails);
              accDets.balance = this.utilService.formatAmountWithComma(_acc.balance.toFixed(2));
              this.changedAccountDetails.emit(accDets);
              let _inpData = {
                trans_amount: Math.abs(investmentChange).toString(),
                account_id: this.accountDetails.id,
                trans_date: this.utilService.convertDate(),
                trans_desc: "Periodic Profit/Loss",
                trans_type: (investmentChange < 0) ? "DEBIT" : "CREDIT",
                user_id: this.utilService.appUserId.toString()
              }
              this.apiService.saveTransactionOnly([_inpData]).subscribe({
                next: (resp: any) => {
                  if (resp[0].success === true) {
                    this.utilService.showAlert("Stock Data refreshed successfully", 'success');
                  } else {
                    this.utilService.showAlert(resp);
                  }
                }, error: err => {
                  this.utilService.showAlert(err);
                }
              });
            } else {
              this.utilService.showAlert(accApiRespData);
            }
          }, error: (err: any) => {
            this.utilService.showAlert(err);
          }
        });
      } else {
        this.utilService.showAlert("Validation of Stocks Mapping Update Response Failed !");
      }
    }
  }

  redeem(content: TemplateRef<any>, evt: any, isFullRedemption = true) {
    let data = evt.value;
    this.selectedEqScheme = data;
    data['redeemType'] = (isFullRedemption) ? 'Fully' : 'Partially';
    this.dialogTitle = 'Redeem "' + data.stock_name + '" ' + data.redeemType + ' ?';
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
    this.modifiedRecord = this.selectedEqScheme;
    this.modifiedRecord.newAmount = Number(event.rdmAmt);
    this.modifiedRecord.newCmp = Number(event.rdmCMP);
    this.modifiedRecord.newTransDate = this.utilService.convertDate(event.rdmDte);
    this.modifiedRecord.newNoOfShares = Number(event.rdmNoOfShares);
    this.modifiedRecord.is_valid = event.valid;
  }

  confirmRedeem(item: any) {
    if (item.is_valid == false) {
      this.utilService.showAlert('One or more form fields are invalid');
    } else {
      if (item.newNoOfShares > Number(item.no_of_shares)) {
        this.utilService.showAlert("You can redeem only upto the number of shares that you hold");
        return;
      }
      let _transObj_ = {
        trans_desc: "Redeemed " + this.utilService.formatAmountWithComma(item.newAmount.toFixed(2)) + " from " + item.stock_name + " (" + item.stock_symbol + ")",
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
              balance: this.utilService.roundUpAmt(this.utilService.formatStringValueToAmount(item.account_data.balance) - item.newAmount)
            };
            this.apiService.updateAccount([_accObj_]).subscribe({
              next: (accResp: any) => {
                if (accResp[0].success === true) {
                  let _eqObj_ = {
                    stock_symbol: item.stock_symbol,
                    no_of_shares: item.newNoOfShares
                  };
                  this.apiService.updateStockMapping(_eqObj_).subscribe({
                    next: (eqMapUpdResp: any) => {
                      if (eqMapUpdResp.success == true) {
                        this.modalRef.close('Save clicked');
                        this.utilService.showAlert("Stock Redemption Successful", 'success');
                        this.populateDashboard();
                      } else {
                        this.utilService.showAlert(eqMapUpdResp);
                      }
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

  viewDetails(evt: any) {
    let data = evt.value;
    this.selectedData.emit(data);
  }
}