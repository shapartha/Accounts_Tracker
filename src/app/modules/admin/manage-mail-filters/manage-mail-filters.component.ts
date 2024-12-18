import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationExtras, Router } from '@angular/router';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ConfirmData } from 'app/models/confirm';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-manage-mail-filters',
  standalone: true,
  imports: [CommonModule, MatIconModule, ContextMenuModule],
  templateUrl: './manage-mail-filters.component.html',
  styleUrl: './manage-mail-filters.component.scss'
})
export class ManageMailFiltersComponent {

  mailFilters: any[] = [];
  selectedRecord: any;

  @Output() confirmObject = new EventEmitter<any>();
  @Input() deleteClicked: boolean = false;

  constructor(public utilService: UtilService, private apiService: ApiService, private router: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['deleteClicked'].isFirstChange() && changes['deleteClicked'].currentValue == true) {
      this.deleteMailFilterMapping(this.selectedRecord.mapping_id);
    }
  }

  ngOnInit(): void {
    this.fetchAllMailFilters();
  }

  loadAccount(accId: any, data: any) {
    this.apiService.getAccountById({ account_id: accId }).subscribe({
      next: (fetchAccResp: any) => {
        if (fetchAccResp.success === true) {
          data['accountName'] = fetchAccResp.dataArray[0].account_name;
        } else {
          this.utilService.showAlert("Account not found in the system");
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  fetchAllMailFilters() {
    this.mailFilters = [];
    this.apiService.getAllMailFilterMappings().subscribe({
      next: (data: any) => {
        if (data.dataArray !== undefined) {
          this.mailFilters = data.dataArray;
          this.mailFilters.forEach(element => {
            this.loadAccount(element.acc_id, element);
          });
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  update(e: any) {
    let item = e.value;
    let objToSend: NavigationExtras = {
      queryParams: item,
      skipLocationChange: false,
      fragment: 'top'
    };
    this.router.navigate(['add-mail-filter'], { state: objToSend });
  }

  delete(e: any) {
    this.selectedRecord = e.value;
    let modalTitle = "Delete this mail filter mapping ?";
    let modalBody = "You're about to DELETE this mail filter mapping. Do you want to continue ?";
    let modalBtnName = 'Delete';
    let confirmData: ConfirmData = {
      type: 'DELETE-MAIL-FILTER',
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

  deleteMailFilterMapping(id: any) {
    this.apiService.deleteMailFilterMapping([{ mapping_id: id }]).subscribe({
      next: (resp: any) => {
        if (resp[0].success == true && resp[0].response == '200') {
          this.utilService.showAlert('Mail Filter deleted successfully', 'success');
          this.confirmObject.emit({
            modalTitle: 'modalTitle',
            modalBody: 'modalBody',
            modalBtnName: 'modalBtnName',
            canClose: true,
            confirmData: {},
            record: this.selectedRecord
          });
          this.fetchAllMailFilters();
        } else {
          this.utilService.showAlert('An error occurred deleting this mail filter');
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }
}
