import { Component, OnInit, inject } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from './modules/common/footer/footer.component';
import { HeaderComponent } from './modules/common/header/header.component';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatIconModule, MatTooltipModule, RouterOutlet, CommonModule, NgxSpinnerModule,
    HeaderComponent, FooterComponent
  ],
  templateUrl: './app.component.html',
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } }],
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Accounts_Tracker';
  authService: AuthService;
  isLoggedIn: boolean = false;
  loginSubscription: Subscription | undefined;

  scrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }
  constructor() {
    this.authService = inject(AuthService);
    this.isLoggedIn = this.authService.checkLogin();
  }

  ngOnInit(): void {
    this.loginSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => this.isLoggedIn = isLoggedIn);
  }

}
