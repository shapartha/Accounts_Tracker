import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
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
  selector: 'app-map-stock',
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, FormsModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule, CommonModule, MatInputModule],
  templateUrl: './map-stock.component.html',
  styleUrl: './map-stock.component.scss'
})
export class MapStockComponent implements OnInit {

  form: FormGroup;
  accList: any[] = [];
  stocks: any;

  constructor(private fb: FormBuilder, private apiService: ApiService, public utilService: UtilService, private router: Router) {
    this.form = this.fb.group({
      accountId: [],
      noOfShares: [],
      purchasePrice: [],
      stockSymbol: [],
      purchaseDate: [],
      invAmount: [{ value: '', disabled: true }],
      cmp: [{ value: '', disabled: true }],
      lastMarketDate: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadStocks();
    this.form.get('noOfShares')?.valueChanges.subscribe(() => {
      this.onChangePriceNumber();
    });
    this.form.get('purchasePrice')?.valueChanges.subscribe(() => {
      this.onChangePriceNumber();
    });
  }

  loadAccounts() {
    this.apiService.getAllAccounts({ user_id: this.utilService.appUserId }).subscribe({
      next: (fetchAccResp: any) => {
        if (fetchAccResp.success === true) {
          this.accList = fetchAccResp.dataArray.filter((_acc: any) => _acc.is_equity === '1');
        } else {
          this.utilService.showAlert("No stock accounts found in the system");
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  loadStocks() {
    this.apiService.getAllStocks().subscribe({
      next: (fetchStocksResp: any) => {
        this.stocks = [];
        if (fetchStocksResp.success === true) {
          if (fetchStocksResp.response !== '200') {
            this.utilService.showAlert("No Stocks found in the system");
          }
          else {
            this.stocks = fetchStocksResp.dataArray;
          }
        }
      }
    });
  }

  onChangePriceNumber() {
    let data = this.form.value;
    let invAmount = this.utilService.roundUpAmt(data.noOfShares * data.purchasePrice);
    this.form.get('invAmount')?.setValue(invAmount);
  }

  async onChangeEQ(data: MatSelectChange) {
    this.form.get('cmp')?.reset();
    this.form.get('lastMarketDate')?.reset();
    const fetchMfNavResp: any = await firstValueFrom(this.apiService.fetchStockCMP(data.value));
    if (fetchMfNavResp.message.toUpperCase() === "SUCCESS") {
      this.form.get('cmp')?.setValue(this.utilService.roundUpAmt(fetchMfNavResp.data.pricecurrent));
      this.form.get('lastMarketDate')?.setValue(this.utilService.formatDate(this.utilService.convertDate(fetchMfNavResp.data.lastupd)));
    }
  }

  mapStock() {
    let data = this.form.getRawValue();
    if (data.accountId == undefined || data.accountId == null) {
      this.utilService.showAlert("Account is not selected or invalid");
      return;
    }
    if (data.noOfShares == undefined || data.noOfShares == null || data.noOfShares == 0) {
      this.utilService.showAlert("No. of Shares is blank or invalid");
      return;
    }
    if (data.purchasePrice == undefined || data.purchasePrice == null || data.purchasePrice == 0) {
      this.utilService.showAlert("Price per share is blank or invalid");
      return;
    }
    if (data.purchaseDate == undefined || data.purchaseDate == null) {
      this.utilService.showAlert("Purchase Date is blank or invalid");
      return;
    }
    if (data.stockSymbol == undefined || data.stockSymbol == null || data.invAmount == undefined || data.invAmount == null || Number(data.invAmount) === 0) {
      this.utilService.showAlert("Company Stock is either not selected or invalid");
      return;
    }
    let inpObj = {
      stock_symbol: data.stockSymbol,
      stock_name: this.stocks.filter((eq: any) => eq.stock_symbol === data.stockSymbol)[0].stock_name,
      no_of_shares: Number(this.utilService.roundUpAmount(data.noOfShares, 0)),
      purchase_date: this.utilService.convertDate(data.purchaseDate),
      user_id: this.utilService.appUserId.toString(),
      purchase_price: this.utilService.roundUpAmt(data.purchasePrice),
      account_id: data.accountId,
      inv_amt: this.utilService.roundUpAmt(data.invAmount)
    };
    this.apiService.saveStockMapping([inpObj]).subscribe({
      next: (saveStockMappResp: any) => {
        if (saveStockMappResp[0].success !== true) {
          this.utilService.showAlert(saveStockMappResp[0]);
        } else {
          let trans: SaveTransaction = {};
          trans.acc_id = inpObj.account_id;
          trans.amount = inpObj.inv_amt.toString();
          trans.date = inpObj.purchase_date;
          trans.desc = inpObj.no_of_shares + " shares of " + inpObj.stock_name + " mapped to account: " + this.accList.filter((_acc: any) => _acc.account_id === inpObj.account_id)[0].account_name;
          trans.type = "CREDIT";
          trans.user_id = this.utilService.appUserId.toString();
          this.apiService.saveTransaction(trans).subscribe({
            next: (addTransResp: any) => {
              if (addTransResp.success !== true) {
                this.utilService.showAlert(addTransResp);
              } else {
                this.utilService.showAlert("Stock Mapped !!!", 'success');
                this.form.reset();
              }
            }, error: (err) => {
              console.error(err);
              this.utilService.showAlert(err);
            }
          });
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
}
