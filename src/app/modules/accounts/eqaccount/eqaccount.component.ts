import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { Account } from 'app/models/account';
import { AllTransactionsComponent } from 'app/modules/transactions/all-transactions/all-transactions.component';
import { UtilService } from 'app/services/util.service';
import { EqDashboardComponent } from './eqdashboard/eqdashboard.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-eqaccount',
  standalone: true,
  imports: [MatTabsModule, CommonModule, AllTransactionsComponent, EqDashboardComponent],
  templateUrl: './eqaccount.component.html',
  styleUrl: './eqaccount.component.scss'
})
export class EqAccountComponent implements OnInit {

  inputAccountData: any;
  transactionHeader: string = '';
  showAmount = '';
  selectedTab = new FormControl(0);

  constructor(private route: ActivatedRoute, public utilService: UtilService) {
    this.route.queryParams.subscribe(params => {
      this.inputAccountData = params as Account;
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

  refreshEqData() {
    this.utilService.refreshEqData.next(true);
  }

  updatedAccDetails(acc: Account) {
    this.inputAccountData = acc;
    this.showAmount = this.inputAccountData.balance;
  }
}
