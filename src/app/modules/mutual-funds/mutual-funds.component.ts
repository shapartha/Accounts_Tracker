import { Component } from '@angular/core';
import { ManageMutualFundsComponent } from "./manage/manage.component";
import { AddMutualFundsComponent } from "./add/add.component";
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmDialogComponent } from "../modals/confirm-dialog/confirm-dialog.component";
import { ConfirmData } from 'app/models/confirm';
import { UtilService } from 'app/services/util.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-mutual-funds',
  standalone: true,
  imports: [ManageMutualFundsComponent, AddMutualFundsComponent, MatTabsModule, ConfirmDialogComponent],
  templateUrl: './mutual-funds.component.html',
  styleUrl: './mutual-funds.component.scss'
})
export class MutualFundsComponent {

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
    if (evt.type == 'DELETE-MF' && evt.value == true) {
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

  refreshMFs() {
    this.invokeRefresh = true;
    setTimeout(() => {
      this.invokeRefresh = false;
    }, 400);
  }
}
