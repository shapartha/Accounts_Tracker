import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { Category } from 'app/models/category';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-add-update-account',
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, FormsModule, MatSelectModule, CommonModule, MatInputModule, MatSlideToggleModule],
  templateUrl: './add-update-account.component.html',
  styleUrl: './add-update-account.component.scss'
})
export class AddUpdateAccountComponent implements OnInit {
  @Input() isUpdate: boolean = false;
  form: FormGroup;
  categories: Category[] = [];
  @Input() updateAccount: any;
  @Output() formData: EventEmitter<any> = new EventEmitter();

  constructor(private fb: FormBuilder, private apiService: ApiService, public utilService: UtilService, private router: Router) {
    this.form = this.fb.group({
      accountId: [],
      accountName: [],
      category: [],
      balance: [0],
      isMf: [false],
      isEquity: [false]
    });
    this.getAllCategories();
  }

  ngOnInit(): void {
    if (this.isUpdate) {
      this.form = this.fb.group({
        accountId: [this.updateAccount.id],
        accountName: [this.updateAccount.name],
        category: [this.updateAccount.category_id],
        balance: [this.utilService.formatStringValueToAmount(this.updateAccount.balance)],
        isMf: [this.updateAccount.is_mf],
        isEquity: [this.updateAccount.is_equity]
      });
    }
    this.formData.emit(this.form.value);
    this.form.valueChanges.subscribe(val => {
      val['valid'] = this.form.valid;
      this.formData.emit(val);
    });
  }

  handleRoute(path: string) {
    this.router.navigate([path]);
  }

  saveTrans() {
    let item = this.form.value;
    if (item.accountName == undefined || item.accountName?.length! < 3) {
      this.utilService.showAlert("Account name must be atleast 3 characters");
      return;
    }
    if (item.category == undefined || item.category == '') {
      this.utilService.showAlert("Select a valid Category for the account");
      return;
    }
    if (item.balance == undefined || item.balance == null) {
      this.utilService.showAlert("Please enter the current balance. If no current balance, enter '0'");
      return;
    }
    let _acc = {
      account_id: item.accountId,
      account_name: item.accountName,
      balance: item.balance.toString(),
      user_id: this.utilService.appUserId,
      category_id: item.category
    };
    this.apiService.saveAccount([_acc]).subscribe({
      next: (resp: any) => {
        if (resp[0].success === true) {
          let inputParams = {
            account_name: item.accountName,
            user_id: this.utilService.appUserId
          };
          if (item.balance > 0) {
            this.apiService.getAccountsByName(inputParams).subscribe({
              next: (data: any) => {
                let inputData = {} as any;
                inputData.trans_amount = item.balance;
                inputData.account_id = data.dataArray[0].account_id;
                inputData.trans_date = this.utilService.convertDate();
                inputData.trans_desc = "Initial Balance";
                inputData.trans_type = "CREDIT";
                inputData.user_id = this.utilService.appUserId.toString();
                this.apiService.saveTransactionOnly([inputData]).subscribe({
                  next: (resp: any) => {
                    if (resp[0].response == "200") {
                      this.utilService.showAlert('Account: ' + item.accountName + ' created successfully', 'success');
                      this.handleRoute('home');
                    } else {
                      this.utilService.showAlert("Some error occurred while saving Transaction. Please try again");
                    }
                  }, error: (err) => {
                    console.error(err);
                    this.utilService.showAlert('Error Occurred while Saving Transaction ! Please contact ADMIN -> ' + JSON.stringify(err));
                  }
                });
              }, error: (err) => {
                console.error(err);
                this.utilService.showAlert('Error Occurred while Saving Account ! Please contact ADMIN -> ' + JSON.stringify(err));
              }
            });
          } else {
            this.utilService.showAlert('Account: ' + item.accountName + ' created successfully', 'success');
            this.handleRoute('home');
          }
        } else {
          this.utilService.showAlert("Some Error occurred creating the account");
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  getAllCategories() {
    let inputParams = {
      user_id: this.utilService.appUserId
    };
    this.apiService.getCategory(inputParams).subscribe({
      next: (data) => {
        this.categories = [];
        if (data.success) {
          for (var i = 0; i < data.dataArray.length; i++) {
            let _category: Category = {} as any;
            _category.name = data.dataArray[i].category_name;
            _category.id = data.dataArray[i].category_id;
            _category.amount = this.utilService.formatAmountWithComma((Math.round(Number(data.dataArray[i].balance) * 100) / 100).toFixed(2));
            this.categories.push(_category);
          }
        } else {
          this.utilService.showAlert('No categories found for user');
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }
}
