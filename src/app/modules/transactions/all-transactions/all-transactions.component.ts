import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, computed, Input, OnInit, signal, TemplateRef, WritableSignal } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ApiConstants } from 'app/const/api.constants';
import { AppConstants } from 'app/const/app.constants';
import { Account } from 'app/models/account';
import { ConfirmData } from 'app/models/confirm';
import { Transaction } from 'app/models/transaction';
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';
import { UpdateTransactionComponent } from 'app/modules/modals/update-transaction/update-transaction.component';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-all-transactions',
  standalone: true,
  imports: [CommonModule, MatIconModule, ContextMenuModule, ConfirmDialogComponent, UpdateTransactionComponent, MatChipsModule, MatAutocompleteModule,
    MatInputModule, MatSelectModule
  ],
  templateUrl: './all-transactions.component.html',
  styleUrl: './all-transactions.component.scss'
})
export class AllTransactionsComponent implements OnInit {
  inputAccountData: any;
  inputSearchObj: any;
  transactions: Transaction[] = [];
  totalTransactions: number = 0;
  transactionStartOffset: number = 0;
  transactionEndOffset: number = AppConstants.FETCH_RECORDS_COUNT;
  apiFuncName = '';
  noOfRecordsFetched: number = 0;
  disableNext: boolean = false;
  disablePrev: boolean = false;
  totalRecords: number = 0;
  showPaginator: boolean = true;
  inputParams: any;
  transactionHeader: string = 'All Transactions';
  pageLoaded = false;
  showAmount = '';
  canClose: boolean = false;
  modalTitle: string = '';
  modalBody: string = '';
  confirmData: ConfirmData = {} as any;
  selectedRecord: any;
  modalRef: any;
  updateTrans: any;
  modifiedRecord: any = {};
  modalBtnName: string = '';
  transDescriptionForAll: string = '';

  @Input() accountId = null;

  tagId: string = '';
  tagName: string = '';

  constructor(private route: ActivatedRoute, public utilService: UtilService, private apiService: ApiService, private modalService: NgbModal, private router: Router) {
    this.route.queryParams.subscribe({
      next: (params) => {
        if (params['text'] != null) {
          history.replaceState(params, '');
          this.inputSearchObj = params;
          if (this.pageLoaded == true) {
            this.totalTransactions = 0;
            this.transactionStartOffset = 0;
            this.transactionEndOffset = AppConstants.FETCH_RECORDS_COUNT;
            this.ngOnInit();
          }
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    })
  }

  ngOnInit(): void {
    this.pageLoaded = true;
    this.tagId = this.route.snapshot.paramMap.get('tagId') || '';
    if (this.accountId != null) {
      this.inputAccountData = {
        id: this.accountId
      } as Account;
    } else {
      if (history.state != null) {
        this.inputAccountData = history.state as Account;
      } else {
        this.inputAccountData = {} as Account;
      }
    }
    this.inputParams = {
      user_id: this.utilService.appUserId,
      limit: this.transactionStartOffset + ", " + this.transactionEndOffset
    };
    if (this.inputAccountData != null && this.inputAccountData.id != null) {
      this.apiFuncName = ApiConstants.API_GET_TRANS_BY_ACCOUNT;
      this.inputParams.account_id = this.inputAccountData.id;
      this.showAmount = this.inputAccountData.balance;
      this.transactionHeader = this.inputAccountData.name + " - Transactions";
    } else if (this.inputSearchObj != null && this.inputSearchObj.user_id != null) {
      this.apiFuncName = ApiConstants.API_SEARCH_TRANSACTION;
      this.inputParams.text = this.inputSearchObj.text;
      this.transactionHeader = "Transactions containing text - " + this.inputSearchObj.text;
    } else {
      if (this.tagId != '') {
        this.apiFuncName = ApiConstants.API_GET_TRANS_BY_TAGID;
        this.inputParams.tag_id = this.tagId;
        this.inputParams.user_id = this.utilService.appUserId;
        this.showPaginator = false;
      } else {
        this.apiFuncName = ApiConstants.API_GET_ALL_TRANS;
      }
    }
    history.replaceState({}, '');
    this.disablePrev = true;
    if (this.apiFuncName == '') {
      this.disableNext = true;
      this.transactionStartOffset = -1;
      this.noOfRecordsFetched = 1;
      return;
    }
    this.fetchTransactions(this.inputParams, this.apiFuncName);
    this.loadAllTags();
  }

  next() {
    if (this.noOfRecordsFetched < AppConstants.FETCH_RECORDS_COUNT) {
      this.transactionStartOffset += this.noOfRecordsFetched;
    } else {
      this.transactionStartOffset += this.transactionEndOffset;
    }
    this.inputParams.limit = this.transactionStartOffset + ", " + this.transactionEndOffset;
    this.fetchTransactions(this.inputParams, this.apiFuncName);
  }

  prev() {
    this.transactionStartOffset -= this.transactionEndOffset;
    if (this.transactionStartOffset <= 0) {
      this.transactionStartOffset = 0;
      this.disablePrev = true;
    }
    this.inputParams.limit = this.transactionStartOffset + ", " + this.transactionEndOffset;
    this.fetchTransactions(this.inputParams, this.apiFuncName);
  }

  update(content: TemplateRef<any>, data: any, isViewOnly = false) {
    if (isViewOnly == true) {
      this.updateTrans = data;
    } else {
      this.updateTrans = data.value;
    }
    this.updateTrans.isViewOnly = isViewOnly;
    this.modalRef = this.modalService.open(content,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        fullscreen: 'md',
        scrollable: true,
        size: 'lg'
      });
  }

  showSectionsForSelectAll() {
    let showSelectAllSections = false;
    for (const item of this.transactions as any[]) {
      if (item.selected === true) {
        showSelectAllSections = true;
        break;
      }
    }
    return showSelectAllSections;
  }

  select(e: any) {
    this.selectedRecord = e.value;
    this.selectedRecord.selected = !this.selectedRecord.selected;
  }

  selectAllActive = false;

  selectAll(e: any) {
    this.selectAllActive = !this.selectAllActive;
    this.transactions.forEach((item: any) => {
      item.selected = this.selectAllActive;
    });
    if (!this.selectAllActive) {
      this.removeAllTags();
    }
  }

  delete(e: any) {
    this.selectedRecord = e.value;
    this.modalTitle = "Delete " + this.selectedRecord.description;
    this.modalBody = "You are about to delete this transaction. Do you want to continue ?";
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
    if (evt.type == 'SET-DELIVERED' && evt.value == true) {
      let _updTrans = {
        is_delivered: true,
        trans_id: this.selectedRecord.id
      };
      this.updateTransaction(_updTrans, true);
    } else if (evt.type == 'DELETE' && evt.value == true) {
      if (this.selectedRecord.is_mf == true || this.selectedRecord.is_equity == true) {
        this.utilService.showAlert("Transactions can't be deleted. Please Redeem/Sell units to perform transactions", "Close");
        return;
      }
      this.apiService.deleteTransaction([{ trans_id: this.selectedRecord.id }]).subscribe({
        next: (data: any) => {
          if (data[0].success === true) {
            if (this.selectedRecord.transType.toUpperCase() == "DEBIT") {
              this.selectedRecord.acc_balance = parseFloat(this.selectedRecord.acc_balance) + this.utilService.formatStringValueToAmount(this.selectedRecord.amount);
            } else {
              this.selectedRecord.acc_balance = parseFloat(this.selectedRecord.acc_balance) - this.utilService.formatStringValueToAmount(this.selectedRecord.amount);
            }
            let _acc = {
              account_id: this.selectedRecord.acc_id,
              account_name: this.selectedRecord.acc_name,
              balance: this.selectedRecord.acc_balance.toString(),
              user_id: this.selectedRecord.user_id,
              category_id: this.selectedRecord.cat_id
            };
            this.apiService.updateAccount([_acc]).subscribe({
              next: (data: any) => {
                if (data[0].success === true) {
                  this.utilService.showAlert("Transaction " + this.selectedRecord.description + " deleted successfully", "success");
                  this.canClose = true;
                  if (this.inputAccountData != null && this.inputAccountData.id != null) {
                    this.showAmount = this.utilService.formatAmountWithComma(this.selectedRecord.acc_balance.toString());
                  }
                  this.fetchTransactions(this.inputParams, this.apiFuncName);
                } else {
                  this.utilService.showAlert("Some Error occurred updating the account details.");
                }
              }, error: (err) => {
                console.error(err);
                this.utilService.showAlert(err);
              }
            });
            this.deleteAssociatedTags(this.selectedRecord.id);
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

  deleteAssociatedTags(transId: any) {
    this.apiService.deleteTagsMappingForTransId([{ trans_id: transId }]).subscribe({
      next: (resp: any) => {
        if (resp[0].success != true || resp[0].response != '200') {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  markDeliveryOrder(e: any) {
    let item = e.value;
    let _updTrans = {
      is_delivery_order: ((item.is_delivery_order == undefined || item.is_delivery_order == 0) ? true : false),
      trans_id: item.id
    };
    this.updateTransaction(_updTrans);
  }

  setOrderDelivered(e: any) {
    this.selectedRecord = e.value;
    this.modalTitle = "Set this order as Delivered ?";
    this.modalBody = "Are you sure you want to set this order as DELIVERED ?";
    this.modalBtnName = 'Set';
    this.confirmData = {
      type: 'SET-DELIVERED',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  updateTransaction(_obj_: any, viaConfirm = false) {
    if (!Array.isArray(_obj_)) {
      _obj_ = [_obj_];
    }
    this.apiService.updateTransaction(_obj_).subscribe({
      next: (resp: any) => {
        if (resp[0].success === true) {
          this.utilService.showAlert("Transaction Updated Successfully.", "success");
          if (viaConfirm) {
            this.canClose = true;
          }
          this.selectAllActive = false;
          this.fetchTransactions(this.inputParams, this.apiFuncName);
        } else {
          this.utilService.showAlert("Transaction Update Failed. Failure: " + JSON.stringify(resp[0]));
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert("Transaction Update Failed. Error: " + JSON.stringify(err), "Close");
      }
    });
  }

  showUpdate(value: any) {
    return value['selected'] != true;
  }

  showSelectAll(value: any) {
    return value['selected'];
  }

  showDeleteCopy(value: any) {
    return value['is_mf'] != true && value['is_equity'] != true && value['selected'] != true;
  }

  showMarkDelivery(value: any) {
    return value['is_mf'] != true && value['is_equity'] != true && value['is_delivery_order'] != true && value['is_delivered'] != true && value['selected'] != true;
  }

  showUnmarkSetDelivery(value: any) {
    return value['is_mf'] != true && value['is_equity'] != true && value['is_delivery_order'] == true && value['is_delivered'] != true && value['selected'] != true;
  }

  getCustomClass(value: any, existingClass: string, negativeClass: string, positiveClass: string) {
    let classListValue = this.getMoneyVal(value, existingClass, negativeClass, positiveClass);
    if (value.selected == true) {
      classListValue += ' selected';
    }
    return classListValue;
  }

  getMoneyVal(value: any, existingClass: string, negativeClass: string, positiveClass: string) {
    let _type = value.transType;
    let classListValue = existingClass;
    classListValue += _type.toUpperCase().indexOf("DEBIT") != -1 ? negativeClass : positiveClass;
    return classListValue;
  }

  fetchTransactions(inputParams: any, apiName: string) {
    this.apiService.getTransactions(inputParams, apiName).subscribe({
      next: (trans) => {
        this.transactions = [];
        if (trans.dataArray === undefined) {
          return;
        }
        this.noOfRecordsFetched = 0;
        trans.dataArray!.forEach((item: any) => {
          let _trans: Transaction = {} as any;
          _trans.id = item.trans_id;
          _trans.description = item.trans_desc;
          _trans.transType = item.trans_type;
          _trans.amount = this.utilService.formatAmountWithComma((Math.round(item.trans_amount! * 100) / 100).toFixed(2));
          _trans.date = this.utilService.formatDate(item.trans_date);
          _trans.acc_name = item.account_name;
          _trans.is_mf = item.is_mf;
          _trans.is_equity = item.is_equity;
          _trans.is_delivery_order = item.is_delivery_order;
          _trans.is_delivered = item.is_delivered;
          _trans.acc_id = item.account_id;
          _trans.acc_name = item.account_name;
          _trans.cat_id = item.category_id;
          _trans.user_id = item.user_id;
          _trans.acc_balance = item.balance;
          _trans.receiptImgId = item.trans_receipt_image_id;
          this.transactions.push(_trans);
          this.noOfRecordsFetched++;
        });
        if (this.noOfRecordsFetched < AppConstants.FETCH_RECORDS_COUNT) {
          this.disableNext = true;
        } else {
          this.disableNext = false;
        }
        if (this.noOfRecordsFetched > 0) {
          this.totalRecords = Number(trans.dataArray[0].NUM_REC);
          this.disablePrev = false;
          if (this.transactionStartOffset - this.transactionEndOffset < 0) {
            this.disablePrev = true;
          }
        }
        if (this.tagId != '') {
          this.tagName = trans.dataArray[0].tag_name;
          this.transactionHeader = "Transactions tagged with Tag - " + this.tagName;
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  updatedRecord(event: any) {
    this.modifiedRecord.trans_id = event.transId;
    this.modifiedRecord.trans_desc = event.transDesc;
    this.modifiedRecord.trans_date = this.utilService.convertDate(event.transDate);
    this.modifiedRecord.preview_url = event.previewUrl;
    this.modifiedRecord.user_id = this.utilService.appUserId;
    this.modifiedRecord.is_valid = event.valid;
    this.modifiedRecord.imageUpdated = event.imageUpdated;
    this.modifiedRecord.fileBitmap = event.fileBitmap;
    this.modifiedRecord.isPdf = event.isPdf;
    this.modifiedRecord.is_valid = event.valid;
    this.modifiedRecord.tags = {
      add: event.tagChanges.new.filter((element: any) => !event.tagChanges.existing.includes(element)),
      remove: event.tagChanges.existing.filter((element: any) => !event.tagChanges.new.includes(element))
    };
  }

  saveOrUpdate(item: any) {
    if (item.is_valid == null) {
      this.utilService.showAlert("Nothing to update here since NO changes are made");
      return;
    } else if (item.is_valid == true) {
      if (item.trans_desc == undefined || item.trans_desc?.length! < 3) {
        this.utilService.showAlert("Description must be atleast 3 characters");
        return;
      }
      if (item.trans_date == undefined || item.trans_date == null) {
        this.utilService.showAlert("Date is invalid or blank");
        return;
      }
      if (item.imageUpdated == true) {
        this.upload(item);
      } else {
        let _updTrans = {
          trans_desc: item.trans_desc,
          trans_id: item.trans_id,
          user_id: item.user_id,
          trans_date: item.trans_date
        };
        this.updateTransFn(_updTrans, item);
      }
    } else {
      this.utilService.showAlert('One or more form fields are invalid');
    }
  }

  updateTransFn(_obj_: any, _data_: any) {
    this.apiService.updateTransaction([_obj_]).subscribe({
      next: (resp: any) => {
        if (resp[0].success === true) {
          this.modalRef.close('Save clicked');
          this.utilService.showAlert("Transaction Updated Successfully", 'success');
          this.fetchTransactions(this.inputParams, this.apiFuncName);
        } else {
          this.utilService.showAlert("Transaction Update Failed. Failure: " + JSON.stringify(resp[0]));
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert("Transaction Update Failed. Error: " + JSON.stringify(err));
      }
    });
    this.addOrRemoveTags(_obj_.trans_id);
  }

  addOrRemoveTags(transId: any) {
    let inputsToRemove = [];
    let inputsToAdd = [];
    for (var i = 0; i < this.modifiedRecord.tags.remove.length; i++) {
      inputsToRemove.push({
        trans_id: transId,
        tag_id: this.modifiedRecord.tags.remove[i]
      });
    }
    for (var i = 0; i < this.modifiedRecord.tags.add.length; i++) {
      inputsToAdd.push({
        trans_id: transId,
        tag_id: this.modifiedRecord.tags.add[i]
      });
    }
    this.apiService.saveTransTagMapping(inputsToAdd).subscribe({
      next: (resp: any) => {
        if (resp[0].success != true || resp[0].response != '200') {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
    this.apiService.deleteTransTagMapping(inputsToRemove).subscribe({
      next: (resp: any) => {
        if (resp[0].success != true || resp[0].response != '200') {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  upload(item: any) {
    let _inpObj = {
      bitmap_data: item.fileBitmap,
      is_pdf: item.isPdf,
      created_at: this.utilService.getDate()
    }
    this.apiService.uploadReceiptImage(_inpObj).subscribe({
      next: (data: any) => {
        let _updTrans = {
          trans_desc: item.trans_desc,
          trans_id: item.trans_id,
          user_id: item.user_id,
          trans_date: item.trans_date,
          trans_receipt_image_id: data.dataArray[0].receipt_id
        };
        this.updateTransFn(_updTrans, item);
      }, error: (err) => {
        console.error("Error -> " + JSON.stringify(err));
        this.utilService.showAlert("Image Upload Failed due to Error");
      }
    });
  }

  copy(item: any) {
    let objToSend: NavigationExtras = {
      queryParams: item.value,
      skipLocationChange: false,
      fragment: 'top'
    };
    this.router.navigate(['add-transaction'], { state: objToSend });
  }

  updateTags() {
    let inputs: any[] = [];
    this.transactions.filter((item: any) => item.selected == true).forEach((item: any) => {
      this.tags().forEach((tag: any) => {
        inputs.push({
          trans_id: item.id,
          tag_id: tag.tagId
        });
      });
    });
    this.apiService.saveTransTagMapping(inputs).subscribe({
      next: (resp: any) => {
        if (resp.some((item: any) => item.success === true && item.response === '200')) {
          this.utilService.showAlert("Transaction updated with tags successfully. Some transactions may not have been updated. Please validate.", "warning");
          this.transactions.map((item: any) => {
            if (item.selected == true) {
              item.selected = false;
            }
          });
          this.selectAllActive = false;
          this.removeAllTags();
        } else {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  removeTags() {
    let inputs: any[] = [];
    this.transactions.filter((item: any) => item.selected == true).forEach((item: any) => {
      this.tags().forEach((tag: any) => {
        inputs.push({
          trans_id: item.id,
          tag_id: tag.tagId
        });
      });
    });
    
    this.apiService.deleteTransTagMapping(inputs).subscribe({
      next: (resp: any) => {
        if (resp.every((item: any) => item.success === true && item.response === '200')) {
          this.utilService.showAlert("Transaction tags removed successfully.", "success");
          this.transactions.map((item: any) => {
            if (item.selected == true) {
              item.selected = false;
            }
          });
          this.selectAllActive = false;
          this.removeAllTags();
        } else {
          this.utilService.showAlert("Some tags may not have been removed from their transactions. Please validate.", "warning");
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  onChangeUpdateAll(e: any) {
    this.transDescriptionForAll = e.target.value;
  }

  updateAllTransDesc() {
    let _updTrans: any[] = [];
    this.transactions.filter((item: any) => item.selected == true).forEach((item: any) => {
      _updTrans.push({
        trans_desc: this.transDescriptionForAll,
        trans_id: item.id
      });
    });
    this.updateTransaction(_updTrans);
  }
  
  /**
   * 
   * Code below is for Mat Chips with Autocomplete
   * 
   */

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly currentTag = signal('');
  readonly tags: WritableSignal<any[]> = signal([]);
  allTags: any[] = [];
  filteredTags = this.calculateFilteredTags();

  loadAllTags() {
    this.apiService.getAllTags().subscribe({
      next: (resp: any) => {
        if (resp.success == true && resp.response == '200') {
          this.allTags = [];
          resp.dataArray.forEach((element: any) => {
            this.allTags.push({
              tagId: element.tag_id,
              tagName: element.tag_name
            });
          });
        } else {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  add(event: MatChipInputEvent): void {
    this.utilService.showAlert('Please select something from the list');
    return;
  }

  calculateFilteredTags() {
    return computed(() => {
      const currentTag = this.currentTag()?.toLowerCase();
      let finalVal = currentTag ? this.allTags.filter(tag => tag?.tagName?.toLowerCase().includes(currentTag)) : this.allTags.slice();
      return finalVal;
    });
  }

  remove(tag: any): void {
    this.tags.update(tags => {
      const index = tags.indexOf(tag);
      if (index < 0) {
        return tags;
      }
      tags.splice(index, 1);
      this.allTags.push(tag);
      this.filteredTags = this.calculateFilteredTags();
      return [...tags];
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.update(tags => [...tags, event.option.value]);
    this.allTags.splice(this.allTags.findIndex(idx => idx.tagId == event.option.value.tagId), 1);
    this.filteredTags = this.calculateFilteredTags();
    this.currentTag.set('');
    event.option.deselect();
  }

  onTagInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentTag.set(input.value);
  }

  removeAllTags() {
    this.tags.update(tags => {
      tags.forEach(tag => {
        this.allTags.push(tag);
      });
      tags.length = 0;
      this.filteredTags = this.calculateFilteredTags();
      return [...tags];
    });
  }
}
