import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Account } from 'app/models/account';
import { UtilService } from 'app/services/util.service';
import { AllTransactionsComponent } from "../../transactions/all-transactions/all-transactions.component";
import { ActivatedRoute } from '@angular/router';
import { MfDashboardComponent } from './mfdashboard/mfdashboard.component';

@Component({
  selector: 'app-mfaccount',
  standalone: true,
  imports: [MatTabsModule, CommonModule, AllTransactionsComponent, MfDashboardComponent],
  templateUrl: './mfaccount.component.html',
  styleUrl: './mfaccount.component.scss'
})
export class MfAccountComponent implements OnInit {

  inputAccountData: any;
  transactionHeader: string = '';
  showAmount = '';

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
}
