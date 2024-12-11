import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services/auth.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent {
  constructor(private utilService: UtilService, private router: Router, private authService: AuthService) {
    let _loggedInUser = this.utilService.appUserId;
    if (_loggedInUser == undefined || isNaN(_loggedInUser) || _loggedInUser == 0) {
      this.router.navigate(['login']);
    } else {
      this.utilService.eraseCookie("app-user-id");
      this.utilService.eraseCookie("app-token");
      this.utilService.eraseCookie("gapi_apikey");
      this.utilService.eraseCookie("gapi_clientid");
      this.utilService.removeSessionStorageData("gapi_gmail_data");
      this.utilService.showAlert('Logged Out ! Redirecting to Login Page ...', 'success');
      setTimeout(() => {
        this.authService.logout();
        this.utilService.removeAlert();
        this.router.navigate(['login']);
      }, 3000);
    }
  }
}
