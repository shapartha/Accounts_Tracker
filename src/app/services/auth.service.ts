import { Injectable, inject } from '@angular/core';
import { UtilService } from './util.service';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this.isLoggedIn.asObservable();

  constructor(private utilService: UtilService, private router: Router) { }

  checkLogin() {
    let _userId = this.utilService.appUserId;
    if (isNaN(_userId)) {
      this.isLoggedIn.next(false);
      this.router.navigate(['login']);
      return false;
    } else {
      this.isLoggedIn.next(true);
      return true;
    }
  }

  login() {
    this.isLoggedIn.next(true);
  }

  logout() {
    this.isLoggedIn.next(false);
  }
}

export const AuthGuard: CanActivateFn = (): boolean => {
  return inject(AuthService).checkLogin();
}
