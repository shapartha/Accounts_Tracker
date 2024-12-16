import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { Router } from '@angular/router';
import { Account } from 'app/models/account';
import { Category } from 'app/models/category';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { EnvConstants } from 'env/default';
import { RecurringComponent } from '../transactions/recurring/recurring.component';
import { ScheduledComponent } from '../transactions/scheduled/scheduled.component';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ConfirmDialogComponent } from '../modals/confirm-dialog/confirm-dialog.component';
import { ConfirmData } from 'app/models/confirm';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddUpdateAccountComponent } from "../accounts/add-update-account/add-update-account.component";
import { AddUpdateCategoryComponent } from '../categories/add-update-category/add-update-category.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatListModule, RecurringComponent, ScheduledComponent, ContextMenuModule, ConfirmDialogComponent, AddUpdateAccountComponent, AddUpdateCategoryComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  linkPath = EnvConstants.UI_HOSTED_URL;
  categories: Category[] = [];
  selectedCategory: Category = {} as any;
  modalBody: string = '';
  modalTitle: string = '';
  confirmData: ConfirmData = {} as any;
  canClose: boolean = false;
  selectedRecord: any;
  modalBtnName: string = '';
  updateObject: any;
  modalRef: any;
  modifiedRecord: any = {};

  constructor(private apiService: ApiService, public utilService: UtilService, private router: Router, private modalService: NgbModal) { }

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
        this.categories = [];
        if (data.success) {
          for (var i = 0; i < data.dataArray.length; i++) {
            let categoryAmt = 0;
            let _category: Category = {} as any;
            _category.name = data.dataArray[i].category_name;
            _category.id = data.dataArray[i].category_id;
            _category.image = this.linkPath + 'assets/images/categories/' + data.dataArray[i].image;
            _category.amount = this.utilService.formatAmountWithComma((Math.round(Number(data.dataArray[i].balance) * 100) / 100).toFixed(2));
            _category.accounts = [];
            this.categories.push(_category);
            let inputParams2 = {
              category_id: _category.id,
              user_id: this.utilService.appUserId
            };
            this.apiService.getAccountsByCategory(inputParams2).subscribe({
              next: (val) => {
                if (val.success) {
                  let __category = this.categories.find(cat => cat.id == _category.id)!;
                  __category.accounts = [];
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
                    __category.accounts.push(_account);
                  }
                  __category.amount = this.utilService.formatAmountWithComma((Math.round(categoryAmt * 100) / 100).toFixed(2));
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

  refresh(event: any = null) {
    this.getAllCategories();
    this.selectedCategory = {} as Category;
  }

  showDeleteCopy(value: any) {
    return value['is_mf'] != true && value['is_equity'] != true;
  }

  update(content: TemplateRef<any>, data: any) {
    this.updateObject = data.value;
    let itemType = Object.keys(this.updateObject).indexOf('accounts') != -1 ? 'CATEGORY' : 'ACCOUNT';
    this.updateObject.itemType = itemType;
    this.modalRef = this.modalService.open(content,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        fullscreen: 'md',
        scrollable: true,
        size: 'lg'
      }
    );
  }

  updatedRecord(event: any) {
    if (this.updateObject.itemType == 'CATEGORY') {
      this.modifiedRecord.categoryId = event.categoryId;
      this.modifiedRecord.categoryName = event.categoryName;
      this.modifiedRecord.userId = this.utilService.appUserId;
      this.modifiedRecord.is_valid = event.valid;
    } else {
      this.modifiedRecord.accountId = event.accountId;
      this.modifiedRecord.accountName = event.accountName;
      this.modifiedRecord.userId = this.utilService.appUserId;
      this.modifiedRecord.category = event.category;
      this.modifiedRecord.balance = event.balance;
      this.modifiedRecord.isMf = event.isMf;
      this.modifiedRecord.isEquity = event.isEquity;
      this.modifiedRecord.is_valid = event.valid;
    }
  }

  saveOrUpdate(item: any) {
    if (item.is_valid == null) {
      this.utilService.showAlert("Nothing to update here since NO changes are made");
      return;
    } else if (item.is_valid == true) {
      if (this.updateObject.itemType == 'CATEGORY') {
        this.updateCategory(item);
      } else {
        this.updateAccount(item);
      }
    } else {
      this.utilService.showAlert('One or more form fields are invalid');
    }
  }

  updateCategory(item: any) {
    if (item.categoryName == undefined || item.categoryName?.length < 3) {
      this.utilService.showAlert("Category name must be atleast 3 characters");
      return;
    }
    let _category = {
      category_id: item.categoryId,
      category_name: item.categoryName,
      user_id: this.utilService.appUserId
    };
    this.apiService.updateCategory([_category]).subscribe({
      next: (resp: any) => {
        if (resp[0].success === true) {
          this.modalRef.close('Save clicked');
          this.utilService.showAlert('Category updated successfully', 'success');
          this.refresh();
        } else {
          this.utilService.showAlert(resp[0].responseDescription);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert('Some error occurred while saving category. Please contact admin');
      }
    });
  }

  updateAccount(item: any) {
    if (item.accountName == undefined || item.accountName?.length < 3) {
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
      category_id: item.category,
      is_mf: (item.isMf ? 1 : 0),
      is_equity: (item.isEquity ? 1 : 0)
    };
    this.apiService.updateAccount([_acc]).subscribe({
      next: (resp: any) => {
        if (resp[0].success === true) {
          if (this.utilService.formatStringValueToAmount(this.updateObject.balance) !== item.balance) {
            let _diffAmt = item.balance - this.utilService.formatStringValueToAmount(this.updateObject.balance);
            let _inpData = {
              trans_amount: Math.abs(_diffAmt).toString(),
              account_id: item.accountId,
              trans_date: this.utilService.convertDate(),
              trans_desc: "Adjustments",
              trans_type: (_diffAmt < 0 ? "DEBIT" : "CREDIT"),
              user_id: this.utilService.appUserId.toString()
            }
            this.apiService.saveTransactionOnly([_inpData]).subscribe({
              next: (resp: any) => {
                if (resp[0].response == "200") {
                  this.modalRef.close('Save clicked');
                  this.utilService.showAlert('Account updated successfully', 'success');
                  this.refresh();
                } else {
                  this.utilService.showAlert("Some error occurred while saving transaction. Please contact admin");
                }
              }, error: (err) => {
                console.error(err);
                this.utilService.showAlert('Some error occurred while saving transaction. Please contact admin');
              }
            });
          } else {
            this.modalRef.close('Save clicked');
            this.utilService.showAlert('Account updated successfully', 'success');
            this.refresh();
          }
        } else {
          this.utilService.showAlert("Some Error occurred updating the account details");
        }
      }
    });
  }

  delete(e: any) {
    this.selectedRecord = e.value;
    let itemType = Object.keys(this.selectedRecord).indexOf('accounts') != -1 ? 'CATEGORY' : 'ACCOUNT';
    this.selectedRecord.itemType = itemType;
    this.modalTitle = "Delete " + this.selectedRecord.name;
    this.modalBody = "You are about to delete this " + itemType + ". Do you want to continue ?";
    this.modalBtnName = 'Delete';
    this.confirmData = {
      type: 'DELETE',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  confirm(evt: ConfirmData) {
    if (evt.type == 'DELETE' && evt.value == true) {
      if (this.selectedRecord.itemType == 'CATEGORY') {
        this.apiService.deleteCategory([{ category_id: this.selectedRecord.id }]).subscribe({
          next: (data: any) => {
            if (data[0].success === true) {
              this.utilService.showAlert("Category : " + this.selectedRecord.name + " deleted successfully", "success");
              this.canClose = true;
              this.refresh();
            } else {
              this.utilService.showAlert("An error occurred | " + data[0].response + ":" + data[0].responseDescription);
            }
          }, error: (err) => {
            console.error(err);
            this.utilService.showAlert(err);
          }
        });
      } else if (this.selectedRecord.itemType == 'ACCOUNT') {
        this.apiService.deleteAccount([{ account_id: this.selectedRecord.id }]).subscribe({
          next: (data: any) => {
            if (data[0].success === true) {
              this.utilService.showAlert("Account : " + this.selectedRecord.name + " deleted successfully", "success");
              this.canClose = true;
              this.refresh();
            } else {
              this.utilService.showAlert("An error occurred | " + data[0].response + ":" + data[0].responseDescription);
            }
          }, error: (err) => {
            console.error(err);
            this.utilService.showAlert(err);
          }
        });
      }
    }
  }
}
