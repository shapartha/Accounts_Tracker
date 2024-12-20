import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-add-stocks',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddStocksComponent implements OnInit, OnChanges {

  form: FormGroup;
  @Output() switchTab = new EventEmitter<any>();
  @Input() updateRecord: any;
  headerLabel: string = '';

  ngOnInit(): void {
    if (this.updateRecord != null) {
      this.headerLabel = 'Update Stock';
    } else {
      this.headerLabel = 'Add Stock';
    }
  }

  constructor(private fb: FormBuilder, private apiService: ApiService, public utilService: UtilService) {
    this.form = this.fb.group({
      stock_symbol: [],
      stock_name: [],
      current_market_price: [],
      last_market_date: []
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['updateRecord'].currentValue != null) {
      let formVals = changes['updateRecord'].currentValue;
      this.form.setValue({
        stock_symbol: formVals.stock_symbol,
        stock_name: formVals.stock_name,
        current_market_price: formVals.current_market_price,
        last_market_date: formVals.last_market_date
      });
      this.onChangeStockSymbol({ target: { value: formVals.stock_symbol } });
    }
  }

  onChangeStockSymbol(e: any) {
    this.apiService.fetchStockCMP(e.target.value).subscribe({
      next: (fetchLatestCMPResp: any) => {
        if (fetchLatestCMPResp.code === '200') {
          this.form.patchValue({
            stock_name: fetchLatestCMPResp.data.company,
            current_market_price: fetchLatestCMPResp.data.pricecurrent,
            last_market_date: this.utilService.formatDate(this.utilService.convertDate(fetchLatestCMPResp.data.lastupd))
          });
        } else {
          this.form.patchValue({
            stock_name: '',
            current_market_price: '',
            last_market_date: ''
          });
          this.utilService.showAlert(fetchLatestCMPResp);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  saveStock() {
    if (!this.form.valid) {
      this.utilService.showAlert("All the form fields are required");
      return;
    }
    let inputs = this.form.value;
    inputs.last_market_date = this.utilService.convertDate(inputs.last_market_date);
    if (this.headerLabel == 'Update Stock') {
      this.updateStock(inputs);
    } else {
      this.apiService.saveStock([inputs]).subscribe({
        next: (saveStockResp: any) => {
          if (saveStockResp != null && saveStockResp[0] != null && saveStockResp[0].success === true) {
            this.utilService.showAlert("Stock Added Successfully", 'success');
            this.form.reset();
            this.switchTab.emit({ refresh: true, tabId: 0 });
          } else {
            this.utilService.showAlert(saveStockResp);
          }
        }, error: (err) => {
          console.error(err);
          this.utilService.showAlert(err);
        }
      });
    }
  }

  updateStock(inputs: any) {
    this.apiService.updateStock([inputs]).subscribe({
      next: (editStockResp: any) => {
        if (editStockResp != null && editStockResp[0] != null && editStockResp[0].success === true) {
          this.utilService.showAlert("Stock Updated Successfully", 'success');
          this.form.reset();
          this.switchTab.emit({ refresh: true, tabId: 0 });
        } else {
          this.utilService.showAlert(editStockResp);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  handleRoute() {
    this.switchTab.emit({ refresh: true, tabId: 0 });
  }
}
