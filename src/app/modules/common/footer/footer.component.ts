import { Component, OnInit } from '@angular/core';
import { AppInfo } from 'app-info';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.versionInfo = "Version: " + AppInfo.version + " Build Date: " + AppInfo.buildDate;
  }
  currentYear: any;
  versionInfo = '';
}
