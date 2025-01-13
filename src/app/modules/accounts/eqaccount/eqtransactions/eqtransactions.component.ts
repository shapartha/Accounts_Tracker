import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-eqtransactions',
  standalone: true,
  imports: [ContextMenuModule, CommonModule],
  templateUrl: './eqtransactions.component.html',
  styleUrl: './eqtransactions.component.scss'
})
export class EqTransactionsComponent implements OnInit, OnChanges {
  @Input() eqAccount = {} as any;
  eqTransRecords: any[] = [];
  selectedRecord: any;
  @Output() confirmObject = new EventEmitter<any>();
  @Input() deleteClicked: boolean = false;
  transactionsModified: boolean = false;

  constructor(public utilService: UtilService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadEqTransactions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // throw new Error('Method not implemented.');
  }

  loadEqTransactions() {
    this.apiService.getAllEqMappingsByAccountSymbol(this.eqAccount).subscribe({
      next: eqTrans => {
        this.eqTransRecords = [];
        eqTrans.dataArray.forEach((element: any) => {
          this.eqTransRecords.push(element);
        });
      }
    });
  }

  getMoneyValue(value: any, existingClass: string, negativeClass: string, positiveClass: string) {
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
}
