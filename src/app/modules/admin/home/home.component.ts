import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PendingDeliveryComponent } from "../pending-delivery/pending-delivery.component";
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';
import { ConfirmData } from 'app/models/confirm';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [MatTabsModule, PendingDeliveryComponent, ConfirmDialogComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class AdminHomeComponent {

  modalTitle: string = '';
  modalBody: string = '';
  modalBtnName: string = '';
  confirmData: ConfirmData = {} as any;
  canClose: boolean = false;
  selected: any;
  invokeSetDelivered: boolean = false;

  confirm(evt: ConfirmData) {
    if (evt.type == 'SET-DELIVERED' && evt.value == true) {
      this.invokeSetDelivered = true;
      setTimeout(() => {
        this.invokeSetDelivered = false;
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
}
