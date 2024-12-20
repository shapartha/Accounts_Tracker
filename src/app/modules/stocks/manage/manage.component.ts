import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ConfirmData } from 'app/models/confirm';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-manage-stocks',
  standalone: true,
  imports: [ContextMenuModule, CommonModule],
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.scss'
})
export class ManageStocksComponent implements OnInit, OnChanges {

  stocks: any = [];
  selectedRecord: any;

  @Output() confirmObject = new EventEmitter<any>();
  @Input() deleteClicked: boolean = false;
  @Input() refreshClicked: boolean = false;
  @Output() switchTab = new EventEmitter<any>();
  @Output() updateData = new EventEmitter<any>();

  constructor(private apiService: ApiService, public utilService: UtilService) { }

  ngOnInit(): void {
    this.getInitData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['deleteClicked']?.isFirstChange() && changes['deleteClicked']?.currentValue == true) {
      this.deleteStock(this.selectedRecord.stock_symbol);
    }
    if (!changes['refreshClicked']?.isFirstChange() && changes['refreshClicked']?.currentValue == true) {
      this.refreshAllNav();
    }
  }

  getInitData() {
    this.apiService.getAllStocks().subscribe({
      next: (getAllStocksResp: any) => {
        if (getAllStocksResp.success === true) {
          if (getAllStocksResp.response !== '200') {
            this.utilService.showAlert(JSON.stringify(getAllStocksResp));
          }
          this.stocks = getAllStocksResp.dataArray;
        } else {
          this.utilService.showAlert("Non-Success Response: " + JSON.stringify(getAllStocksResp));
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  update(e: any) {
    let item = e.value;
    this.switchTab.emit({ refresh: true, tabId: 1 });
    this.updateData.emit(item);
  }

  delete(e: any) {
    this.selectedRecord = e.value;
    let modalTitle = "Delete this stock ?";
    let modalBody = "You're about to DELETE this stock. Do you want to continue ?";
    let modalBtnName = 'Delete';
    let confirmData: ConfirmData = {
      type: 'DELETE-STOCK',
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

  deleteStock(id: any) {
    this.apiService.deleteStock([{ stock_symbol: id }]).subscribe({
      next: (resp: any) => {
        if (resp[0].success == true && resp[0].response == '200') {
          this.utilService.showAlert('Stock deleted successfully', 'success');
          this.confirmObject.emit({
            canClose: true,
            record: this.selectedRecord
          });
          this.getInitData();
        } else {
          this.utilService.showAlert('An error occurred deleting this stock');
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  async refreshAllNav() {
    if (this.stocks.length > 0) {
      for (var i = 0; i < this.stocks.length; i++) {
        let element = this.stocks[i];
        let stockSymbol = element.stock_symbol;
        const stockApiResponse = await firstValueFrom(this.apiService.fetchStockCMP(stockSymbol));
        if (stockApiResponse.code === "200") {
          element['current_market_price'] = stockApiResponse.data.pricecurrent;
          element['last_market_date'] = this.utilService.convertDate(stockApiResponse.data.lastupd);
        }
      }
      this.apiService.updateStock(this.stocks).subscribe({
        next: (editStockResp: any) => {
          if (editStockResp != null && editStockResp[0] != null && editStockResp[0].success === true) {
            this.utilService.showAlert("Stocks Updated Successfully", 'success');
          } else {
            this.utilService.showAlert(editStockResp);
          }
        }, error: (err) => {
          console.error(err);
          this.utilService.showAlert(err);
        }
      });
    }
  }
}
