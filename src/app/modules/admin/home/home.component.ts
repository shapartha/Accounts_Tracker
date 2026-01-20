import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { PendingDeliveryComponent } from "../pending-delivery/pending-delivery.component";
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';
import { ConfirmData } from 'app/models/confirm';
import { ManageMailFiltersComponent } from "../manage-mail-filters/manage-mail-filters.component";
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { ApiConstants } from 'app/const/api.constants';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [MatTabsModule, PendingDeliveryComponent, ConfirmDialogComponent, ManageMailFiltersComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class AdminHomeComponent implements OnInit {

  modalTitle: string = '';
  modalBody: string = '';
  modalBtnName: string = '';
  confirmData: ConfirmData = {} as any;
  canClose: boolean = false;
  selected: any;
  invokeSetDelivered: boolean = false;
  invokeDeleted: boolean = false;

  constructor(private apiService: ApiService, public utilService: UtilService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['messageType'] == 'success') {
        this.utilService.showAlert('Database Backup process completed successfully', 'success');
      }
    });
  }

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
    } else if (evt.type == 'MONTHLY-ROUTINES' && evt.value == true) {
      this.reinitializeMonthlyRoutines();
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
    let accList = [];
    let categoryId = '';
    this.apiService.getAllAccounts({ user_id: this.utilService.appUserId }).subscribe({
      next: (fetchAccResp: any) => {
        if (fetchAccResp.success === true) {
          if (stocksUpdate) {
            accList = fetchAccResp.dataArray.filter((_acc: any) => _acc.is_equity === '1');
          } else {
            accList = fetchAccResp.dataArray.filter((_acc: any) => _acc.is_mf === '1');
          }
          if (accList != null && accList.length > 0) {
            categoryId = accList[0].category_id;
            this.invokeExternalApi(stocksUpdate, categoryId);
          } else {
            if (stocksUpdate) {
              this.utilService.showAlert("No stock accounts found in the system");
            } else {
              this.utilService.showAlert("No mutual fund accounts found in the system");
            }
          }
        } else {
          this.utilService.showAlert("No accounts found in the system");
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  invokeExternalApi(stocksUpdate: boolean, categoryId: string | number) {
    let inputs = {
      stocks_update: stocksUpdate,
      user_id: this.utilService.appUserId,
      category_id: categoryId
    }
    this.apiService.invokeMfStockUpdater(inputs).subscribe({
      next: (response: any) => {
        if (response.success == true) {
          this.utilService.showAlert((stocksUpdate == true ? "Stocks" : "Mutual Funds") + " refresh completed", 'success');
        } else {
          this.utilService.showAlert(response.responseDescription);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  reinitializeMonthlyRoutines() {
    let inputs = {
      user_id: this.utilService.appUserId
    };
    this.apiService.invokeMonthlyRoutines(inputs).subscribe({
      next: (response: any) => {
        if (response.success == true) {
          this.utilService.showAlert("Monthly routines refresh completed", 'success');
          this.canClose = true;
        } else {
          this.utilService.showAlert(response.responseDescription);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  invokeMonthlyRoutines() {
    this.modalTitle = "Re-Initialize the monthly routines ?";
    this.modalBody = "You're about to re-initialize the monthly recurring transactions. This will set all the recurring transactions as 'NOT PROCESSED' for current month. Do you want to continue ?";
    this.modalBtnName = 'Sure';
    this.confirmData = {
      type: 'MONTHLY-ROUTINES',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  invokeBackup(onlyUpload = false) {
    window.location.href = this.apiService.backupDbSchema({ onlyUpload: onlyUpload });
    // this.utilService.showAlert("Coming back soon ... ! Due to the current system infrastructure limitations, this feature (DB/Schema Backup) is unavailable.", 'warning');
  }
}
