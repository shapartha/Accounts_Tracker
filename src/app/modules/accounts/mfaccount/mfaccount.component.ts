import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Account } from 'app/models/account';
import { UtilService } from 'app/services/util.service';
import { AllTransactionsComponent } from "../../transactions/all-transactions/all-transactions.component";
import { ActivatedRoute } from '@angular/router';
import { MfDashboardComponent } from './mfdashboard/mfdashboard.component';
import { FormControl } from '@angular/forms';
import { ApiService } from 'app/services/api.service';
import { MfTransactionsComponent } from "./mftransactions/mftransactions.component";
import { ConfirmData } from 'app/models/confirm';
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-mfaccount',
  standalone: true,
  imports: [MatTabsModule, CommonModule, AllTransactionsComponent, MfDashboardComponent, MfTransactionsComponent, ConfirmDialogComponent],
  templateUrl: './mfaccount.component.html',
  styleUrl: './mfaccount.component.scss'
})
export class MfAccountComponent implements OnInit {

  inputAccountData: any;
  transactionHeader: string = '';
  showAmount = '';
  selectedTab = new FormControl(0);
  selectedMfScheme: any;

  modalTitle: string = '';
  modalBody: string = '';
  modalBtnName: string = '';
  confirmData: ConfirmData = {} as any;
  canClose: boolean = false;
  invokeDeleted: boolean = false;
  selected: any;

  confirm(evt: ConfirmData) {
    if (evt.type == 'DELETE-MF-TRANS' && evt.value == true) {
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

  switchTab(e: any) {
    if (e.refresh == true) {
      this.selectedTab.setValue(e.tabId);
    }
  }

  refreshMfData() {
    this.utilService.refreshMfData.next(true);
  }

  updatedAccDetails(acc: Account) {
    this.inputAccountData = acc;
    this.showAmount = this.inputAccountData.balance;
  }

  onMfSchemeSelected(evt: any) {
    if (evt != null) {
      this.selectedMfScheme = evt;
      this.selectedTab.setValue(2);
    }
  }

  onTabChange(evt: any) {
    this.selectedTab.setValue(evt);
    if (evt != 2) {
      this.selectedMfScheme = null;
    }
  }
}
