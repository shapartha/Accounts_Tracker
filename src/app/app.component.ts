import { Component } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from './modules/common/footer/footer.component';
import { HeaderComponent } from './modules/common/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatIconModule, MatTooltipModule, RouterOutlet,
    HeaderComponent, FooterComponent
],
  templateUrl: './app.component.html',
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } }],
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Accounts_Tracker';

  scrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }
}
