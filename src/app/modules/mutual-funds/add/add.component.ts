import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
export class AddMutualFundsComponent implements OnInit {

  form: FormGroup;
  filteredMfList: Observable<any[]>;
  mfList: any[] = [];
  @Output() switchTab = new EventEmitter<any>();

  ngOnInit(): void {
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
      schemeName: []
    });
    this.filteredMfList = of([]);
  }

  onChangeSchemeCode(e: any) {
    this.apiService.fetchMfNav(e.target.value).subscribe({
      next: (fetchLatestMfNavResp: any) => {
        if (fetchLatestMfNavResp.status === 'SUCCESS') {
          this.form.get('schemeName')?.setValue(fetchLatestMfNavResp.meta.scheme_name);
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
  }

  saveMutualFund() {
    if (!this.form.valid) {
      this.utilService.showAlert("All the form fields are required");
      return;
    }
    let inputs = {
      scheme_code: this.form.value.schemeCode,
      scheme_name: this.form.value.schemeName
    }
    this.apiService.saveMutualFund([inputs]).subscribe({
      next: (saveMfResp: any) => {
        if (saveMfResp[0].success === true) {
          this.utilService.showAlert("Mutual Fund Added Successfully", 'success');
          this.form.reset();
          this.switchTab.emit({ refresh: true });
        } else {
          this.utilService.showAlert(saveMfResp[0]);
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
