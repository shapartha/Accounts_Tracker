import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit {

  linkUrl: string = '';

  constructor(public utilService: UtilService) { }

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.size > 0 && urlParams.get('messageType') == 'success') {
      this.linkUrl = '';
    } else {
      this.linkUrl = this.utilService.getCookie('redir-link');
    }
  }

  navigation() {
    if (this.linkUrl != '') {
      window.location.href = this.linkUrl;
    } else {
      window.close();
    }
  }

}
