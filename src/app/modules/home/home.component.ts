import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { Router } from '@angular/router';
import { AppConstants } from 'app/const/app.constants';
import { Account } from 'app/models/account';
import { Category } from 'app/models/category';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatListModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  linkPath = AppConstants.UI_HOSTED_URL;
  categories: Category[] = [];
  selectedCategory: Category = {} as any;

  constructor(private apiService: ApiService, private utilService: UtilService, private router: Router) { }

  ngOnInit(): void {
    this.getAllCategories();
  }

  setCategory(val: any) {
    this.selectedCategory = this.categories.find(cat => cat.id == val)!;
    setTimeout(() => {
      if (window.innerWidth < 768) {
        let carDtlSec = (document.getElementById('selected-catagory-section') as HTMLElement);
        window.scrollTo(0, carDtlSec.offsetTop);
      }
    }, 300);
  }

  getClassVal(value: any) {
    return this.utilService.getClassVal(value);
  }

  getAllCategories() {
    let inputParams = {
      user_id: this.utilService.appUserId
    };
    this.apiService.getCategory(inputParams).subscribe({
      next: (data) => {
        if (data.success) {
          for (var i = 0; i < data.dataArray.length; i++) {
            let categoryAmt = 0;
            let _category: Category = {} as any;
            _category.name = data.dataArray[i].category_name;
            _category.id = data.dataArray[i].category_id;
            _category.image = this.linkPath + 'assets/images/categories/' + data.dataArray[i].image;
            _category.amount = this.utilService.formatAmountWithComma((Math.round(Number(data.dataArray[i].balance) * 100) / 100).toFixed(2));

            let inputParams2 = {
              category_id: _category.id,
              user_id: this.utilService.appUserId
            };
            this.apiService.getAccountsByCategory(inputParams2).subscribe({
              next: (val) => {
                if (val.success) {
                  _category.accounts = [];
                  for (var j = 0; j < val.dataArray.length; j++) {
                    categoryAmt += parseFloat(val.dataArray[j].balance);
                    let _account: Account = {} as any;
                    _account.id = val.dataArray[j].account_id;
                    _account.name = val.dataArray[j].account_name;
                    _account.category_id = val.dataArray[j].category_id;
                    _account.category_name = val.dataArray[j].category_name;
                    _account.balance = this.utilService.formatAmountWithComma((Math.round(val.dataArray[j].balance! * 100) / 100).toFixed(2));
                    _account.created_date = val.dataArray[j].created_date;
                    _account.updated_date = val.dataArray[j].updated_date;
                    _account.user_id = Number(val.dataArray[j].user_id);
                    _account.is_equity = Boolean(Number(val.dataArray[j].is_equity));
                    _account.is_mf = Boolean(Number(val.dataArray[j].is_mf));
                    _category.accounts.push(_account);
                  }
                  _category.amount = this.utilService.formatAmountWithComma((Math.round(categoryAmt * 100) / 100).toFixed(2));
                  this.categories.push(_category);
                }
              }, error: (err) => {
                console.error(err);
                this.utilService.showAlert(err);
              }
            });
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

  onAccountSelected(event: MatSelectionListChange) {
    const selectedAccount: Account = event.options[0].value;
    this.router.navigate(['all-transactions'], { state: selectedAccount });
  }
}
