import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PendingDeliveryComponent } from "../pending-delivery/pending-delivery.component";
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';
import { ConfirmData } from 'app/models/confirm';
import { ManageMailFiltersComponent } from "../manage-mail-filters/manage-mail-filters.component";
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [MatTabsModule, PendingDeliveryComponent, ConfirmDialogComponent, ManageMailFiltersComponent],
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
  invokeDeleted: boolean = false;

  constructor(private apiService: ApiService, public utilService: UtilService) { }

  confirm(evt: ConfirmData) {
    if (evt.type == 'SET-DELIVERED' && evt.value == true) {
      this.invokeSetDelivered = true;
      setTimeout(() => {
        this.invokeSetDelivered = false;
      }, 1000);
    } else if (evt.type == 'DELETE-MAIL-FILTER' && evt.value == true) {
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

  invokeMfStockUpdater(stocksUpdate = false) {
    this.apiService.invokeMfStockUpdater(stocksUpdate).subscribe({
      next: (_: any) => {
        this.utilService.showAlert((stocksUpdate == true ? "Stocks" : "Mutual Funds") + " refresh completed", 'success');
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }
}
