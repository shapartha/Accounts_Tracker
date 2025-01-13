import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { Account } from 'app/models/account';
import { AllTransactionsComponent } from 'app/modules/transactions/all-transactions/all-transactions.component';
import { UtilService } from 'app/services/util.service';
import { EqDashboardComponent } from './eqdashboard/eqdashboard.component';
import { FormControl } from '@angular/forms';
import { ApiService } from 'app/services/api.service';
import { EqTransactionsComponent } from './eqtransactions/eqtransactions.component';
import { ConfirmData } from 'app/models/confirm';
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-eqaccount',
  standalone: true,
  imports: [MatTabsModule, CommonModule, AllTransactionsComponent, EqDashboardComponent, EqTransactionsComponent, ConfirmDialogComponent],
  templateUrl: './eqaccount.component.html',
  styleUrl: './eqaccount.component.scss'
})
export class EqAccountComponent implements OnInit {

  inputAccountData: any;
  transactionHeader: string = '';
  showAmount = '';
  selectedTab = new FormControl(0);
  selectedEqScheme: any;
  invokeDeleted: boolean = false;

  modalTitle: string = '';
  modalBody: string = '';
  modalBtnName: string = '';
  confirmData: ConfirmData = {} as any;
  canClose: boolean = false;
  selected: any;

  constructor(private route: ActivatedRoute, public utilService: UtilService, private apiService: ApiService) {
    this.route.queryParams.subscribe(params => {
      this.inputAccountData = params as Account;
      this.apiService.getAccountById({ account_id: this.inputAccountData.id }).subscribe(acc => {
        this.inputAccountData = acc.dataArray[0];
        this.inputAccountData.id = acc.dataArray[0].account_id;
        this.inputAccountData.name = acc.dataArray[0].account_name;
        this.inputAccountData.is_mf = Boolean(Number(acc.dataArray[0].is_mf));
        this.inputAccountData.is_equity = Boolean(Number(acc.dataArray[0].is_equity));
        this.inputAccountData.balance = this.utilService.formatAmountWithComma(acc.dataArray[0].balance);
        this.showAmount = this.inputAccountData.balance;
      });
    });
  }

  ngOnInit(): void {
    this.transactionHeader = this.inputAccountData.name;
    if (this.inputAccountData != null && this.inputAccountData.id != null) {
      this.showAmount = this.inputAccountData.balance;
    }
  }

  confirm(evt: ConfirmData) {
    if (evt.type == 'DELETE-EQ-TRANS' && evt.value == true) {
      this.invokeDeleted = true;
      setTimeout(() => {
        this.invokeDeleted = false;
      }, 1000);
    }
  }

  retrieveConfirmObject(e: any) {
    this.modalTitle = e.modalTitle;
    this.modalBtnName = e.modalBtnName;
    this.modalBody = e.modalBody;
    this.confirmData = e.confirmData;
    this.canClose = e.canClose;
    this.selected = e.record;
  }

  switchTab(e: any) {
    if (e.refresh == true) {
      this.selectedTab.setValue(e.tabId);
    }
  }

  refreshEqData() {
    this.utilService.refreshEqData.next(true);
  }

  updatedAccDetails(acc: Account) {
    this.inputAccountData = acc;
    this.showAmount = this.inputAccountData.balance;
  }

  onEqSchemeSelected(evt: any) {
    if (evt != null) {
      this.selectedEqScheme = evt;
      this.selectedTab.setValue(2);
    }
  }

  onTabChange(evt: any) {
    this.selectedTab.setValue(evt);
    if (evt != 2) {
      this.selectedEqScheme = null;
    }
  }
}
