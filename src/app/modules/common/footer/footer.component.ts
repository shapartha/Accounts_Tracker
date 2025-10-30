import { Component, OnInit } from '@angular/core';
import { AppInfo } from 'app-info';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  constructor(public utilService: UtilService, private apiService: ApiService) { }

  ngOnInit(): void {
    var formattedServerTime = this.utilService.getSessionStorageData("serverTime") || '';
    this.currentYear = new Date().getFullYear();

    if (formattedServerTime == '') {
      this.apiService.readServerTime().subscribe(d => {
        formattedServerTime = d;
        this.utilService.setSessionStorageData("serverTime", formattedServerTime);
        this.versionInfo = "Version: " + AppInfo.version + " Build Date: " + AppInfo.buildDate + " Server Time: " + formattedServerTime;
      });
    }
    
    this.versionInfo = "Version: " + AppInfo.version + " Build Date: " + AppInfo.buildDate + " Server Time: " + formattedServerTime;
  }
  
  currentYear: any;
  versionInfo = '';
}
