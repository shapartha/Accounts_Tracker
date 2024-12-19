import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ConfirmData } from 'app/models/confirm';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-manage-mutual-funds',
  standalone: true,
  imports: [ContextMenuModule, CommonModule],
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.scss'
})
export class ManageMutualFundsComponent implements OnInit, OnChanges {

  mutualFunds: any = [];
  selectedRecord: any;

  @Output() confirmObject = new EventEmitter<any>();
  @Input() deleteClicked: boolean = false;

  constructor(private apiService: ApiService, public utilService: UtilService) { }

  ngOnInit(): void {
    this.getInitData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['deleteClicked'].isFirstChange() && changes['deleteClicked'].currentValue == true) {
      this.deleteMutualFund(this.selectedRecord.scheme_code);
    }
  }

  getInitData() {
    this.apiService.getAllMutualFunds().subscribe({
      next: (getAllMutualFundsResp: any) => {
        if (getAllMutualFundsResp.success === true) {
          if (getAllMutualFundsResp.response !== '200') {
            this.utilService.showAlert(JSON.stringify(getAllMutualFundsResp));
          }
          this.mutualFunds = getAllMutualFundsResp.dataArray;
        } else {
          this.utilService.showAlert("Non-Success Response: " + JSON.stringify(getAllMutualFundsResp));
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  update($event: { event: MouseEvent | KeyboardEvent; value?: any; }) {
    throw new Error('Method not implemented.');
  }

  delete(e: any) {
    this.selectedRecord = e.value;
    let modalTitle = "Delete this mutual fund ?";
    let modalBody = "You're about to DELETE this mutual fund. Do you want to continue ?";
    let modalBtnName = 'Delete';
    let confirmData: ConfirmData = {
      type: 'DELETE-MF',
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

  deleteMutualFund(id: any) {
    this.apiService.deleteMutualFund([{ scheme_code: id }]).subscribe({
      next: (resp: any) => {
        if (resp[0].success == true && resp[0].response == '200') {
          this.utilService.showAlert('Mutual Fund deleted successfully', 'success');
          this.confirmObject.emit({
            canClose: true,
            record: this.selectedRecord
          });
          this.getInitData();
        } else {
          this.utilService.showAlert('An error occurred deleting this mutual fund');
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }
}
