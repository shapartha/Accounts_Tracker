import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmData } from 'app/models/confirm';
import { UtilService } from 'app/services/util.service';
import { ConfirmDialogComponent } from '../modals/confirm-dialog/confirm-dialog.component';
import { AddStocksComponent } from "./add/add.component";
import { ManageStocksComponent } from "./manage/manage.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [MatTabsModule, ConfirmDialogComponent, AddStocksComponent, ManageStocksComponent, CommonModule],
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.scss'
})
export class StocksComponent {

  modalTitle: string = '';
  modalBody: string = '';
  modalBtnName: string = '';
  confirmData: ConfirmData = {} as any;
  canClose: boolean = false;
  selected: any;
  invokeDeleted: boolean = false;
  selectedTab = new FormControl(0);
  updateData: any;
  invokeRefresh: boolean = false;

  constructor(public utilService: UtilService) { }

  confirm(evt: ConfirmData) {
    if (evt.type == 'DELETE-STOCK' && evt.value == true) {
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

  toUpdateRecord(e: any) {
    this.updateData = e;
    setTimeout(() => {
      this.updateData = null;
    }, 400);
  }

  refreshStocks() {
    this.invokeRefresh = true;
    setTimeout(() => {
      this.invokeRefresh = false;
    }, 400);
  }
}
