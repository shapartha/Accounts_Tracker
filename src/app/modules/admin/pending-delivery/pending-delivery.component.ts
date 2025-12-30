import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ConfirmData } from 'app/models/confirm';
import { Transaction } from 'app/models/transaction';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-pending-delivery',
  standalone: true,
  imports: [CommonModule, MatIconModule, ContextMenuModule],
  templateUrl: './pending-delivery.component.html',
  styleUrl: './pending-delivery.component.scss'
})
export class PendingDeliveryComponent implements OnInit, OnChanges {

  pendingDeliveries: Transaction[] = [];
  selectedRecord: any;

  @Output() confirmObject = new EventEmitter<any>();
  @Input() setDeliveredClicked: boolean = false;

  constructor(public utilService: UtilService, private apiService: ApiService, private router: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['setDeliveredClicked'].isFirstChange() && changes['setDeliveredClicked'].currentValue == true) {
      let _updTrans = {
        is_delivered: true,
        trans_id: this.selectedRecord.id
      };
      this.updateTransaction(_updTrans, true);
    }
  }

  ngOnInit(): void {
    this.populateTransactions();
  }

  populateTransactions() {
    this.pendingDeliveries = [];
    var user_id = this.utilService.appUserId;
    this.apiService.getDeliveryTrans({ user_id: user_id }).subscribe({
      next: (data: any) => {
        if (data.dataArray !== undefined) {
          data.dataArray!.forEach((item: any) => {
            let _trans: Transaction = {};
            _trans.id = item.trans_id;
            _trans.description = item.trans_desc;
            _trans.transType = item.trans_type;
            _trans.amount = this.utilService.formatAmountWithComma((Math.round(item.trans_amount! * 100) / 100).toFixed(2));
            _trans.date = this.utilService.formatDate(item.trans_date);
            _trans.acc_name = item.account_name;
            _trans.is_mf = item.is_mf;
            _trans.is_equity = item.is_equity;
            _trans.is_delivery_order = item.is_delivery_order;
            _trans.is_delivered = item.is_delivered;
            _trans.acc_id = item.account_id;
            _trans.acc_name = item.account_name;
            _trans.cat_id = item.category_id;
            _trans.user_id = item.user_id;
            _trans.acc_balance = item.balance;
            _trans.receiptImgId = item.trans_receipt_image_id;
            _trans.is_group_trans = item.trans_item_id == undefined ? false : true;
            this.pendingDeliveries.push(_trans);
          });
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  getClassVal(value: any) {
    let _type = value.transType;
    return _type.toUpperCase().indexOf("DEBIT") != -1 ? 'negative-val' : 'positive-val';
  }

  markDeliveryOrder(e: any) {
    let item = e.value;
    let _updTrans = {
      is_delivery_order: ((item.is_delivery_order == undefined || item.is_delivery_order == 0) ? true : false),
      trans_id: item.id
    };
    this.updateTransaction(_updTrans);
  }

  updateTransaction(inputs: any, fromDialog = false) {
    this.apiService.updateTransaction([inputs]).subscribe({
      next: (resp: any) => {
        if (resp[0].success === true) {
          this.utilService.showAlert("Transaction Updated Successfully.", "success");
          if (fromDialog) {
            this.confirmObject.emit({
              modalTitle: 'modalTitle',
              modalBody: 'modalBody',
              modalBtnName: 'modalBtnName',
              canClose: true,
              confirmData: {},
              record: this.selectedRecord
            });
          }
          this.populateTransactions();
        } else {
          this.utilService.showAlert("Transaction Update Failed. Failure: " + JSON.stringify(resp[0]));
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert("Transaction Update Failed. Error: " + JSON.stringify(err));
      }
    });
  }

  setOrderDelivered(e: any) {
    this.selectedRecord = e.value;
    let modalTitle = "Set this order as Delivered ?";
    let modalBody = "Are you sure you want to set this order as DELIVERED ?";
    let modalBtnName = 'Set';
    let confirmData: ConfirmData = {
      type: 'SET-DELIVERED',
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

  openTransactionGroup(transaction: Transaction) {
    const transId = transaction.id;
    this.router.navigate(['/transaction-group', transId]);
  }
}
