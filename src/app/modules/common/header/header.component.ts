import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmData } from 'app/models/confirm';
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  searchText: string = '';

  constructor(private router: Router, private utilService: UtilService) { }

  search() {
    this.router.navigate(['all-transactions'], {
      queryParams: {
        text: this.searchText,
        user_id: this.utilService.appUserId
      }
    });
  }

  modalTitle: string = '';
  modalBody: string = '';
  modalBtnName: string = '';
  confirmData: ConfirmData = {} as any;
  canClose: boolean = false;

  confirm(e: any) {
    this.router.navigate(['logout']);
    this.canClose = true;
  }

  logout() {
    this.modalTitle = "Logout";
    this.modalBody = "You are about to logout. Do you want to continue ?";
    this.modalBtnName = 'Logout';
    this.confirmData = {
      type: 'LOGOUT',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }
}
