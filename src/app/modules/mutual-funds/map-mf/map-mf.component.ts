import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { SaveTransaction } from 'app/models/transaction';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-map-mf',
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, FormsModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule, CommonModule, MatInputModule],
  templateUrl: './map-mf.component.html',
  styleUrl: './map-mf.component.scss'
})
export class MapMfComponent implements OnInit {

  form: FormGroup;
  accList: any[] = [];
  mutualFunds: any;

  constructor(private fb: FormBuilder, private apiService: ApiService, public utilService: UtilService, private router: Router) {
    this.form = this.fb.group({
      accountId: [],
      invAmount: [],
      units: [],
      schemeCode: [],
      purchaseDate: [],
      nav: [{ value: '', disabled: true }],
      navDate: [{ value: '', disabled: true }],
      avgNav: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadMutualFunds();
    this.form.get('invAmount')?.valueChanges.subscribe(() => {
      this.onChangeAmountUnits();
    });
    this.form.get('units')?.valueChanges.subscribe(() => {
      this.onChangeAmountUnits();
    });
  }

  loadAccounts() {
    this.apiService.getAllAccounts({ user_id: this.utilService.appUserId }).subscribe({
      next: (fetchAccResp: any) => {
        if (fetchAccResp.success === true) {
          this.accList = fetchAccResp.dataArray.filter((_acc: any) => _acc.is_mf === '1');
        } else {
          this.utilService.showAlert("No mutual fund accounts found in the system");
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  loadMutualFunds() {
    this.apiService.getAllMutualFunds().subscribe({
      next: (fetchMfSchemesResp: any) => {
        this.mutualFunds = [];
        if (fetchMfSchemesResp.success === true) {
          if (fetchMfSchemesResp.response !== '200') {
            this.utilService.showAlert("No Mutual Funds found in the system");
          }
          else {
            this.mutualFunds = fetchMfSchemesResp.dataArray;
          }
        }
      }
    });
  }

  async onChangeMF(e: MatSelectChange) {
    if (e.value == '') {
      return;
    }
    if (!this.form.get('purchaseDate')?.valid) {
      this.form.get('schemeCode')?.setValue('');
      this.utilService.showAlert('Select Purchase Date first');
      return;
    }
    this.form.get('nav')?.reset();
    this.form.get('navDate')?.reset();
    this.form.get('avgNav')?.reset();
    const fetchMfNavResp: any = await firstValueFrom(this.apiService.fetchMfNav(e.value));
    if (fetchMfNavResp.status.toUpperCase() === "SUCCESS") {
      let purchaseDte = this.utilService.convertDate(this.form.get('purchaseDate')?.value);
      let purchaseDteValues = fetchMfNavResp.data.find((obj: any) => obj.date == purchaseDte);
      this.form.get('nav')?.setValue((purchaseDteValues == null) ? '' : purchaseDteValues.nav);
      this.form.get('navDate')?.setValue(this.utilService.formatDate(purchaseDte));
      this.onChangeAmountUnits();
    }
  }

  async mapMutualFund() {
    let data = this.form.getRawValue();
    if (data.accountId == undefined || data.accountId == null) {
      this.utilService.showAlert("Account is not selected or invalid");
      return;
    }
    if (data.invAmount == undefined || data.invAmount == null || data.invAmount == 0) {
      this.utilService.showAlert("Invested Amount is blank or invalid");
      return;
    }
    if (data.units == undefined || data.units == null || data.units == 0) {
      this.utilService.showAlert("No. of Units is blank or invalid");
      return;
    }
    if (data.purchaseDate == undefined || data.purchaseDate == null) {
      this.utilService.showAlert("Purchase Date is blank or invalid");
      return;
    }
    if (data.schemeCode == undefined || data.schemeCode == null || data.nav == undefined || data.nav == null) {
      this.utilService.showAlert("Mutual Fund is not selected or invalid");
      return;
    }
    let inpObj = {
      scheme_code: data.schemeCode,
      scheme_name: this.mutualFunds.filter((mf: any) => mf.scheme_code === data.schemeCode)[0].scheme_name,
      units: this.utilService.roundUpAmount(data.units, 4),
      purchase_date: this.utilService.convertDate(data.purchaseDate),
      nav_date: this.utilService.convertDate(data.navDate),
      user_id: this.utilService.appUserId,
      nav_amt: this.utilService.roundUpAmt(data.nav),
      avg_nav: this.utilService.roundUpAmt(data.avgNav),
      account_id: data.accountId,
      inv_amt: this.utilService.roundUpAmt(this.utilService.calculateMfInvestedAmount(data.invAmount, data.purchaseDate))
    };
    this.apiService.getMfSchemesByAccountScheme(inpObj).subscribe({
      next: (checkExistMfMapRes: any) => {
        if (checkExistMfMapRes.success === true && checkExistMfMapRes.dataArray == undefined) {
          this.apiService.saveMfMapping([inpObj]).subscribe({
            next: (saveMfMapResp: any) => {
              if (saveMfMapResp[0].success !== true) {
                this.utilService.showAlert(saveMfMapResp[0]);
              } else {
                this.saveMfTransObject(inpObj);
              }
            }, error: (err) => {
              console.error(err);
              this.utilService.showAlert(err);
            }
          });
        } else {
          this.saveMfTransObject(inpObj, checkExistMfMapRes.dataArray);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });

  }

  saveMfTransObject(inpObj: any, existingMfData?: any[]) {
    let _mfTransObj_ = {
      scheme_code: inpObj.scheme_code,
      account_id: inpObj.account_id,
      trans_date: inpObj.nav_date,
      units: inpObj.units,
      nav: inpObj.avg_nav,
      amount: inpObj.inv_amt,
      trans_type: 'CREDIT',
      balance_units: inpObj.units
    };
    this.apiService.saveMfTrans([_mfTransObj_]).subscribe({
      next: (mfTransResp: any) => {
        if (mfTransResp[0].success !== true) {
          this.utilService.showAlert(mfTransResp[0]);
        } else {
          if (existingMfData !== undefined) {
            this.updateMfMapping(inpObj, existingMfData);
          } else {
            this.saveTransaction(inpObj);
          }
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  updateMfMapping(inpObj: any, existingMfData: any[]) {
    let _updMfMapObj_ = {
      scheme_name: inpObj.scheme_name,
      nav_amt: inpObj.nav_amt,
      units: Number(inpObj.units) + Number(existingMfData[0].units),
      inv_amt: Number(inpObj.inv_amt) + Number(existingMfData[0].inv_amt),
      nav_date: inpObj.nav_date,
      avg_nav: 0,
      account_id: inpObj.account_id,
      scheme_code: inpObj.scheme_code
    };
    _updMfMapObj_.avg_nav = Number((_updMfMapObj_.inv_amt / _updMfMapObj_.units).toFixed(4));
    this.apiService.updateMfMapping([_updMfMapObj_]).subscribe({
      next: (updMfMapResp: any) => {
        if (updMfMapResp[0].success !== true) {
          this.utilService.showAlert(updMfMapResp[0]);
        } else {
          this.saveTransaction(inpObj);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  saveTransaction(inpObj: any) {
    let trans: SaveTransaction = {};
    trans.acc_id = inpObj.account_id;
    trans.amount = inpObj.inv_amt.toString();
    trans.date = inpObj.purchase_date;
    trans.desc = inpObj.scheme_name + " Mapped to Account: " + this.accList.filter((_acc: any) => _acc.account_id === inpObj.account_id)[0].account_name;
    trans.type = "CREDIT";
    trans.user_id = this.utilService.appUserId.toString();
    this.apiService.saveTransaction(trans).subscribe({
      next: (addTransResp: any) => {
        if (addTransResp.success !== true) {
          this.utilService.showAlert(addTransResp);
        } else {
          this.utilService.showAlert("Mutual Fund Mapped !!!", 'success');
          this.form.get('schemeCode')?.reset();
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  handleRoute(path = '') {
    this.router.navigate([path]);
  }

  onChangeAmountUnits() {
    let _avg_nav = (this.form.get('invAmount')?.value / this.form.get('units')?.value);
    this.form.get('avgNav')?.setValue(Number(this.utilService.roundUpAmount(_avg_nav, 4)));
  }
}
