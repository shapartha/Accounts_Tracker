import { transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Account } from 'app/models/account';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-update-recurring',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatSelectModule, MatInputModule, MatSlideToggleModule],
  templateUrl: './update-recurring.component.html',
  styleUrl: './update-recurring.component.scss'
})
export class UpdateRecurringComponent implements OnInit {

  @Input() updateTransaction: any;
  @Input() isFullUpdate: boolean = false;
  form: FormGroup;
  monthDays: number[] = [];
  accList: Account[] = [];
  mfSchemes: any[] = [];
  isMf = false;
  @Output() formData: EventEmitter<any> = new EventEmitter();

  constructor(private fb: FormBuilder, public utilService: UtilService, private apiService: ApiService) {
    this.form = this.fb.group({
      id: [],
      amount: [],
      description: [],
      transDate: [],
      hasExecuted: [],
      accountId: [],
      mfSchemeCode: [],
      reccDate: []
    });
  }

  loadAccounts() {
    let inputParams = { user_id: this.utilService.appUserId };
    this.apiService.getAllAccounts(inputParams).subscribe({
      next: (data) => {
        data.dataArray.forEach((element: any) => {
          if (element.is_equity == false) {
            let _acc: Account = {};
            _acc.id = element.account_id;
            _acc.name = element.account_name;
            _acc.balance = element.balance;
            _acc.category_id = element.category_id;
            _acc.category_name = element.category_name;
            _acc.created_date = element.created_date;
            _acc.is_equity = element.is_equity;
            _acc.is_mf = element.is_mf;
            _acc.updated_date = element.updated_date;
            _acc.user_id = element.user_id;
            this.accList.push(_acc);
          }
        });
        this.onChangeAccount({ value: this.updateTransaction.account_id });
      },
      error: (err) => {
        this.utilService.showAlert(err);
        console.error(err);
      }
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.form.setValue({
      id: this.updateTransaction.rec_trans_id,
      amount: this.updateTransaction.rec_trans_amount,
      description: this.updateTransaction.rec_trans_desc,
      transDate: this.updateTransaction.rec_trans_last_executed,
      hasExecuted: (this.updateTransaction.rec_trans_executed == '1') ? true : false,
      accountId: this.updateTransaction.account_id,
      mfSchemeCode: this.updateTransaction.rec_mf_scheme_code || this.updateTransaction.rec_mf_scheme_name,
      reccDate: this.updateTransaction.rec_trans_date
    });
    if (!this.isFullUpdate) {
      this.form.patchValue({
        transDate: this.utilService.getDate(),
      });
    } else {
      this.form.patchValue({
        amount: this.utilService.roundUpAmount(this.utilService.formatStringValueToAmount(this.updateTransaction.rec_trans_amount)),
        transDate: this.utilService.getDate(this.updateTransaction.rec_trans_last_executed)
      });
    }
    for (var i = 1; i <= 28; i++) {
      this.monthDays.push(i);
    }
    this.formData.emit(this.form.value);
    this.form.valueChanges.subscribe(val => {
      this.formData.emit(val);
    })
  }

  populateMfSchemes(_accId: any) {
    this.mfSchemes = [];
    let inputParams = { account_id: _accId };
    this.apiService.getMfSchemesByAccount(inputParams).subscribe({
      next: (data) => {
        data.dataArray?.forEach((element: any) => {
          this.mfSchemes.push(element);
        });
      },
      error: (err) => {
        console.error(err);
        this.utilService.showAlert('Error loading Mutual Fund Schemes. Try refreshing the page.');
      }
    });
  }

  onChangeAccount(data: any) {
    let selectedAccount = this.accList.find(acc => acc.id == data.value);
    if (selectedAccount?.is_mf != '1') {
      this.isMf = false;
      this.form.get('mfSchemeCode')?.setValue(null);
    } else {
      this.isMf = true;
      this.populateMfSchemes(selectedAccount.id);
    }
  }
}
