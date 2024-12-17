import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-map-mf',
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, FormsModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule, CommonModule, MatInputModule],
  templateUrl: './map-mf.component.html',
  styleUrl: './map-mf.component.scss'
})
export class MapMfComponent implements OnInit {

  form: FormGroup;
  accList: any[] = [];
  mutualFunds: any;

  constructor(private fb: FormBuilder, private apiService: ApiService, public utilService: UtilService, private router: Router) {
    this.form = this.fb.group({
      accountId: [],
      invAmount: [],
      units: [],
      schemeCode: [],
      purchaseDate: [],
      nav: [{ value: '', disabled: true }],
      navDate: [{ value: '', disabled: true }],
      avgNav: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadMutualFunds();
  }

  loadAccounts() {
    this.apiService.getAllAccounts({ user_id: this.utilService.appUserId }).subscribe({
      next: (fetchAccResp: any) => {
        if (fetchAccResp.success === true) {
          this.accList = fetchAccResp.dataArray.filter((_acc: any) => _acc.is_mf === '1');
        } else {
          this.utilService.showAlert("No mutual fund accounts found in the system");
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  loadMutualFunds() {
    this.apiService.getAllMutualFunds().subscribe({
      next: (fetchMfSchemesResp: any) => {
        this.mutualFunds = [];
        if (fetchMfSchemesResp.success === true) {
          if (fetchMfSchemesResp.response !== '200') {
            this.utilService.showAlert("No Mutual Funds found in the system");
          }
          else {
            this.mutualFunds = fetchMfSchemesResp.dataArray;
          }
        }
      }
    });
  }

  async onChangeMF(e: MatSelectChange) {
    if (e.value == '') {
      return;
    }
    if (!this.form.get('purchaseDate')?.valid) {
      this.form.get('schemeCode')?.setValue('');
      this.utilService.showAlert('Select Purchase Date first');
      return;
    }
    this.form.get('nav')?.reset();
    this.form.get('navDate')?.reset();
    this.form.get('avgNav')?.reset();
    const fetchMfNavResp: any = await firstValueFrom(this.apiService.fetchMfNav(e.value));
    if (fetchMfNavResp.status.toUpperCase() === "SUCCESS") {
      let purchaseDte = this.utilService.convertDate(this.form.get('purchaseDate')?.value);
      let purchaseDteValues = fetchMfNavResp.data.find((obj: any) => obj.date == purchaseDte);
      this.form.get('nav')?.setValue((purchaseDteValues == null) ? '' : purchaseDteValues.nav);
      this.form.get('navDate')?.setValue(this.utilService.formatDate(purchaseDte));
      this.onChangeAmountUnits();
    }
  }

  mapMutualFund() {
    throw new Error('Method not implemented.');
  }

  handleRoute(path = '') {
    this.router.navigate([path]);
  }

  onChangeAmountUnits() {
    let _avg_nav = (this.form.get('invAmount')?.value / this.form.get('units')?.value);
    this.form.get('avgNav')?.setValue(Number(this.utilService.roundUpAmount(_avg_nav, 4)));
  }
}
