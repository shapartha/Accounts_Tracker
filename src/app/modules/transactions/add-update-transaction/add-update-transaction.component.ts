import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SaveTransaction, Transaction } from 'app/models/transaction';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { Account } from 'app/models/account';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-add-update-transaction',
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, FormsModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatSelectModule, MatToolbarModule, CommonModule, MatInputModule, MatSlideToggleModule],
  templateUrl: './add-update-transaction.component.html',
  styleUrl: './add-update-transaction.component.scss'
})
export class AddUpdateTransactionComponent implements OnInit {

  form: FormGroup;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      amount: [],
      description: [],
      transDate: [],
      isTransferTrans: [],
      transType: [],
      fromAccDetails: [],
      toAccDetails: []
    });
  }

  ngOnInit(): void {
    this.form.get('isTransferTrans')?.valueChanges.subscribe(data => {
      this.onChangeTransferTrans(data);
    });
  }















  onChangeTransferTrans($event: Event) {
    throw new Error('Method not implemented.');
  }
  onChangeFromAccount($event: MatSelectChange) {
    throw new Error('Method not implemented.');
  }
  onChangeToAccount($event: MatSelectChange) {
    throw new Error('Method not implemented.');
  }
  onChangeMfScheme($event: MatSelectChange) {
    throw new Error('Method not implemented.');
  }
  selectFile($event: Event) {
    throw new Error('Method not implemented.');
  }
  saveTransAndGoBack(arg0: Transaction) {
    throw new Error('Method not implemented.');
  }
  saveTrans(arg0: Transaction) {
    throw new Error('Method not implemented.');
  }
  handleRoute(arg0: string) {
    throw new Error('Method not implemented.');
  }
  currentFile?: File;
  fileUploadMessage = '';
  fileName = 'Select File';

  isTransferTrans = false;
  isRecurringTrans = false;
  isMf = false;
  isMfSchemeSelected = false;
  selectedMfNavDate = "";
  trans: Transaction = {};
  mainAccList: Account[] = [];
  fromAcc: Account[] = [];
  toAcc: Account[] = [];
  monthDays: number[] = [];
  fromAccDetails: string = "";
  fromAccBalance: string = "";
  toAccDetails: string = "";
  toAccBalance: string = "";
  reccDate: string = "";
  mfSchemeCode: string = "";
  mfSchemes: any[] = [];
  isValid: boolean = true;
  saveTransaction: SaveTransaction = {};
  saveTransactionTrans: SaveTransaction = {};
  previewUrl: any;
  fileBitmap: any;
  fileType: any;
  isGoBack = false;

  itemData: any;
}
