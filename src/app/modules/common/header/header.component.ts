import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
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
}
