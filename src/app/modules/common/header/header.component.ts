import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  logout() {
    var isLogout = confirm("You're about to log out. Are you sure?");
    if (isLogout) {
      this.router.navigate(['logout']);
    }
  }
}
