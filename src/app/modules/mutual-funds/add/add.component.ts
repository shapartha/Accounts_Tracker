import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { Observable, startWith, map, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-mf',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddMutualFundsComponent implements OnInit, OnChanges {

  form: FormGroup;
  filteredMfList: Observable<any[]>;
  mfList: any[] = [];
  @Output() switchTab = new EventEmitter<any>();
  @Input() updateRecord: any;
  headerLabel: string = '';

  ngOnInit(): void {
    if (this.updateRecord != null) {
      this.headerLabel = 'Update Mutual Fund';
    } else {
      this.headerLabel = 'Add Mutual Fund';
    }
    this.filteredMfList = this.form.get('schemeName')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.mfList.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  constructor(private fb: FormBuilder, private apiService: ApiService, public utilService: UtilService, private router: Router) {
    this.form = this.fb.group({
      schemeCode: [],
      schemeName: [],
      navAmount: [],
      navDate: []
    });
    this.filteredMfList = of([]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['updateRecord'].currentValue != null) {
      let formVals = changes['updateRecord'].currentValue;
      this.form.setValue({
        schemeCode: formVals.scheme_code,
        schemeName: formVals.scheme_name,
        navAmount: formVals.nav_amount,
        navDate: formVals.nav_date
      });
      this.onChangeSchemeCode({ target: { value: formVals.scheme_code } });
    }
  }

  onChangeSchemeCode(e: any) {
    this.apiService.fetchMfNav(e.target.value).subscribe({
      next: (fetchLatestMfNavResp: any) => {
        if (fetchLatestMfNavResp.status === 'SUCCESS') {
          this.form.patchValue({
            schemeName: fetchLatestMfNavResp.meta.scheme_name,
            navAmount: fetchLatestMfNavResp.data[0].nav,
            navDate: fetchLatestMfNavResp.data[0].date
          });
        } else {
          this.utilService.showAlert(fetchLatestMfNavResp);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  getSchemeCode() {
    this.apiService.fetchMfCode(this.form.get('schemeName')?.value).subscribe({
      next: (fetchMfCode: any) => {
        for (var i = 0; i < fetchMfCode.length; i++) {
          this.mfList[i] = {
            code: fetchMfCode[i].schemeCode,
            name: fetchMfCode[i].schemeName
          };
        }
        this.form.get('schemeName')?.setValue(this.form.get('schemeName')?.value + " ");
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  selectedMfName(e: MatAutocompleteSelectedEvent) {
    let selectedMf = this.mfList.filter(_val => _val.name === e.option.value)[0].code;
    this.form.get('schemeCode')?.setValue(selectedMf);
    this.onChangeSchemeCode({ target: { value: selectedMf } });
  }

  saveMutualFund() {
    if (!this.form.valid) {
      this.utilService.showAlert("All the form fields are required");
      return;
    }
    let inputs = {
      scheme_code: this.form.value.schemeCode,
      scheme_name: this.form.value.schemeName,
      nav_amount: this.form.value.navAmount,
      nav_date: this.form.value.navDate
    }
    if (this.headerLabel == 'Update Mutual Fund') {
      this.updateMutualFund(inputs);
    } else {
      this.apiService.saveMutualFund([inputs]).subscribe({
        next: (saveMfResp: any) => {
          if (saveMfResp != null && saveMfResp[0] != null && saveMfResp[0].success === true) {
            this.utilService.showAlert("Mutual Fund Added Successfully", 'success');
            this.form.reset();
            this.switchTab.emit({ refresh: true, tabId: 0 });
          } else {
            this.utilService.showAlert(saveMfResp);
          }
        }, error: (err) => {
          console.error(err);
          this.utilService.showAlert(err);
        }
      });
    }
  }

  updateMutualFund(inputs: any) {
    this.apiService.updateMutualFund([inputs]).subscribe({
      next: (editMfResp: any) => {
        if (editMfResp != null && editMfResp[0] != null && editMfResp[0].success === true) {
          this.utilService.showAlert("Mutual Fund Updated Successfully", 'success');
          this.form.reset();
          this.switchTab.emit({ refresh: true, tabId: 0 });
        } else {
          this.utilService.showAlert(editMfResp);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  handleRoute(path = '') {
    this.router.navigate([path]);
  }

  preventEnter(e: any) {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  }
}
