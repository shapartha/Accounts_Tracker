import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-add-mail-filter-mapping',
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, FormsModule, MatSelectModule, CommonModule, MatInputModule],
  templateUrl: './add-mail-filter-mapping.component.html',
  styleUrl: './add-mail-filter-mapping.component.scss'
})
export class AddMailFilterMappingComponent implements OnInit {

  form: FormGroup;
  accList: any[] = [];

  constructor(private fb: FormBuilder, private apiService: ApiService, public utilService: UtilService, private router: Router) {
    this.form = this.fb.group({
      account_id: [],
      filterName: [],
      functionName: [],
      debitConditions: [],
      creditConditions: []
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts() {
    this.apiService.getAllAccounts({ user_id: this.utilService.appUserId }).subscribe({
      next: (fetchAccResp: any) => {
        if (fetchAccResp.success === true) {
          this.accList = fetchAccResp.dataArray.filter((_acc: any) => _acc.is_mf !== '1' && _acc.is_equity !== '1');
        } else {
          this.utilService.showAlert("No valid accounts found in the system");
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  saveMapping() {
    let dataObj = this.form.value;
    if (this.utilService.validationJsonString(dataObj.debitConditions) && this.utilService.validationJsonString(dataObj.creditConditions)) {
      let _inp = {
        filter: dataObj.filterName,
        acc_id: dataObj.account_id,
        filter_function: dataObj.functionName,
        debit_conditions_json: dataObj.debitConditions,
        credit_conditions_json: dataObj.creditConditions
      }
      if (dataObj.debitConditions == undefined || dataObj.debitConditions == null || dataObj.debitConditions.trim() == "") {
        delete _inp.debit_conditions_json;
      }
      if (dataObj.creditConditions == undefined || dataObj.creditConditions == null || dataObj.creditConditions.trim() == "") {
        delete _inp.credit_conditions_json;
      }
      this.apiService.saveMailFilterMapping([_inp]).subscribe({
        next: (saveFilterMappingResp: any) => {
          if (saveFilterMappingResp[0].success && saveFilterMappingResp[0].response == '200') {
            this.utilService.showAlert("Filter condition mapped successfully", 'success');
            this.form.reset();
          } else {
            this.utilService.showAlert("Unable to save filter mapping");
          }
        }
      });

    } else {
      this.utilService.showAlert("Conditions are not properly formatted in JSON");
    }
  }

  handleRoute(path = '') {
    this.router.navigate([path]);
  }
}
