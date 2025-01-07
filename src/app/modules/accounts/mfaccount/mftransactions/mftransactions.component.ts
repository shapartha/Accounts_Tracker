import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-mftransactions',
  standalone: true,
  imports: [],
  templateUrl: './mftransactions.component.html',
  styleUrl: './mftransactions.component.scss'
})
export class MfTransactionsComponent implements OnInit {

  @Input() mfAccount = {} as any;
  mfTransRecords: any[] = [];

  constructor(public utilService: UtilService, private apiService: ApiService) { }

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
}
