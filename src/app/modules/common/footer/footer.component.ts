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
    var formattedDbTime = this.utilService.getSessionStorageData("dbTime") || '';
    this.currentYear = new Date().getFullYear();

    if (formattedServerTime == '') {
      this.apiService.readServerTime().then(d => {
        formattedServerTime = d.serverTime;
        this.utilService.setSessionStorageData("serverTime", formattedServerTime);
        formattedDbTime = d.dbTime;
        this.utilService.setSessionStorageData("dbTime", formattedDbTime);
        this.serverInfo = "Server Time: " + formattedServerTime + " DB Time: " + formattedDbTime;
      });
    }
    
    this.versionInfo = "Version: " + AppInfo.version + " Build Date: " + AppInfo.buildDate;
  }
  
  currentYear: any;
  versionInfo = '';
  serverInfo = '';
}
