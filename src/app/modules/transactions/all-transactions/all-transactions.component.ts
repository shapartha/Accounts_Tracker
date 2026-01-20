import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, computed, Input, OnInit, signal, TemplateRef, WritableSignal } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiConstants } from 'app/const/api.constants';
import { AppConstants } from 'app/const/app.constants';
import { Account } from 'app/models/account';
import { ConfirmData } from 'app/models/confirm';
import { SaveTransaction, Transaction } from 'app/models/transaction';
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';
import { UpdateTransactionComponent } from 'app/modules/modals/update-transaction/update-transaction.component';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-all-transactions',
  standalone: true,
  imports: [CommonModule, MatIconModule, ConfirmDialogComponent, UpdateTransactionComponent, MatChipsModule, MatAutocompleteModule,
    MatInputModule, MatSelectModule, MatCheckboxModule
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
  selectedRecord: any | any[];
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
      this.utilService.setSessionStorageData('lastAccountId', this.inputAccountData.id);
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
    this.updateTrans = data;
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
    this.selectedRecord = e;
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

  delete() {
    let itemsToDelete: Transaction[] = [];
    this.transactions.filter((item: any) => item.selected == true).forEach((item: any) => {
      itemsToDelete.push(item);
    });
    this.selectedRecord = itemsToDelete;
    this.modalTitle = "Delete " + this.selectedRecord.length + " record(s)";
    this.modalBody = "You are about to delete " + this.selectedRecord.length + " transaction(s). Do you want to continue ?";
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
      let itemsToSetDelivered: Transaction[] = this.selectedRecord;
      let finalItemsToSetDelivered: any[] = [];

      for (var item of itemsToSetDelivered) {
        if (item.is_mf == '1' || item.is_equity == '1') {
          this.utilService.showAlert("MF/Stock transactions can't be updated. Please uncheck them to proceed", "Close");
          return;
        }

        if (item.is_delivery_order != '1' || item.is_delivered == '1') {
          this.utilService.showAlert("Only Delivery Orders which are not yet delivered can be set as Delivered. Please uncheck invalid items to proceed", "Close");
          return;
        }

        finalItemsToSetDelivered.push({
          trans_id: item.id,
          is_delivered: true
        });
      }

      this.updateTransaction(finalItemsToSetDelivered, true);
    } else if (evt.type == 'RAISE_RETURN' && evt.value == true) {
      let item: Transaction = this.selectedRecord;

      if (item.is_mf == '1' || item.is_equity == '1') {
        this.utilService.showAlert("MF/Stock transactions can't be updated. Please uncheck them to proceed", "Close");
        return;
      }

      if (item.is_delivery_order != '1' && item.is_delivered != '1') {
        this.utilService.showAlert("Only Delivery Orders which are delivered can be set as Return Order. Please uncheck invalid items to proceed", "Close");
        return;
      }
      
      let finalItemToSetReturnOrder = {
        trans_id: item.id,
        is_delivered: true,
        is_return_order: true
      };

      this.updateTransaction([finalItemToSetReturnOrder], true);
    } else if (evt.type == 'RETURNED' && evt.value == true) {
      let item: Transaction = this.selectedRecord;

      if (item.is_mf == '1' || item.is_equity == '1') {
        this.utilService.showAlert("MF/Stock transactions can't be updated. Please uncheck them to proceed", "Close");
        return;
      }

      if (item.is_return_order != '1' || item.is_returned == '1') {
        this.utilService.showAlert("Only Return Orders which are not yet returned can be set as Returned. Please uncheck invalid items to proceed", "Close");
        return;
      }

      let finalItemToSetReturned = {
        trans_id: item.id,
        is_delivered: true,
        is_return_order: true,
        is_returned: true
      };

      this.updateTransaction([finalItemToSetReturned], true);
      this.addRefundTransaction(item);

    } else if (evt.type == 'DELETE' && evt.value == true) {
      let itemsToDelete: Transaction[] = this.selectedRecord;
      let finalItemsToDelete: any[] = [];

      for (var item of itemsToDelete) {
        if (item.is_mf == '1' || item.is_equity == '1') {
          this.utilService.showAlert("MF/Stock transactions can't be deleted. Please uncheck them to proceed", "Close");
          return;
        }

        finalItemsToDelete.push({
          trans_id: item.id
        });
      }

      this.apiService.deleteTransaction(finalItemsToDelete).subscribe({
        next: (data: any) => {
          let counter = -1;
          let accList = [];
          let idList = [];
          for (var item of itemsToDelete) {
            counter++;
            if (data[counter].success === true) {
              if (item.transType!.toUpperCase() == "DEBIT") {
                item.acc_balance = String(parseFloat(item.acc_balance!) + this.utilService.formatStringValueToAmount(item.amount));
              } else {
                item.acc_balance = String(parseFloat(item.acc_balance!) - this.utilService.formatStringValueToAmount(item.amount));
              }
              let _acc = {
                account_id: item.acc_id,
                account_name: item.acc_name,
                balance: item.acc_balance.toString(),
                user_id: item.user_id,
                category_id: item.cat_id
              };
              accList.push(_acc);
              idList.push(item.id)
            } else {
              this.utilService.showAlert("An error occurred | " + data[counter].response + ":" + data[counter].responseDescription);
            }
          }

          this.updateAccountData(accList);
          this.deleteAssociatedTags(idList);
        }, error: (err) => {
          console.error(err);
          this.utilService.showAlert(err);
        }
      });
    }
  }

  updateAccountData(_acc: any[]) {
    this.apiService.updateAccount(_acc).subscribe({
      next: (data: any) => {
        if (data[_acc.length - 1].success === true) {
          this.utilService.showAlert("Transactions deleted successfully", "success");
          this.canClose = true;
          if (this.inputAccountData != null && this.inputAccountData.id != null) {
            this.showAmount = this.utilService.formatAmountWithComma(_acc[_acc.length - 1].balance);
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
  }

  deleteAssociatedTags(transIds: any[]) {
    let idList: any[] = [];

    for (var transId of transIds) {
      idList.push({
        trans_id: transId
      });
    }

    this.apiService.deleteTagsMappingForTransId(idList).subscribe({
      next: (resp: any) => {
        if (resp[idList.length - 1].success != true || resp[idList.length - 1].response != '200') {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  markUnmarkDeliveryOrder(isDelivery: boolean = false) {
    let itemsToMarkDelivery: Transaction[] = [];
    this.transactions.filter((item: any) => item.selected == true).forEach((item: any) => {
      itemsToMarkDelivery.push(item);
    });

    let finalItemsToMarkDelivery: any[] = [];

    for (var item of itemsToMarkDelivery) {
      if (item.is_mf == '1' || item.is_equity == '1') {
        this.utilService.showAlert("MF/Stock transactions can't be updated. Please uncheck them to proceed", "Close");
        return;
      }

      if (item.is_delivered == '1') {
        this.utilService.showAlert("Only Delivery Orders which are not yet delivered can be marked/unmarked as Delivery order. Please uncheck invalid items to proceed", "Close");
        return;
      }

      finalItemsToMarkDelivery.push({
        is_delivery_order: isDelivery,
        trans_id: item.id
      });
    }

    this.updateTransaction(finalItemsToMarkDelivery);
  }

  setOrderDelivered() {
    let itemsToSetDelivered: Transaction[] = [];
    this.transactions.filter((item: any) => item.selected == true).forEach((item: any) => {
      itemsToSetDelivered.push(item);
    });
    this.selectedRecord = itemsToSetDelivered;
    this.modalTitle = "Set " + itemsToSetDelivered.length + " selected order(s) as Delivered ?";
    this.modalBody = "Are you sure you want to set " + this.selectedRecord.length + " order(s) as DELIVERED ?";
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

  showSelectAll(value: any) {
    return value['selected'];
  }

  getCustomClass(value: any, existingClass: string, negativeClass: string, positiveClass: string) {
    let classListValue = this.getMoneyVal(value, existingClass, negativeClass, positiveClass);
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
          _trans.is_return_order = item.is_return_order;
          _trans.is_returned = item.is_returned;
          _trans.acc_id = item.account_id;
          _trans.acc_name = item.account_name;
          _trans.cat_id = item.category_id;
          _trans.user_id = item.user_id;
          _trans.acc_balance = item.balance;
          _trans.receiptImgId = item.trans_receipt_image_id;
          _trans.is_group_trans = item.trans_item_id != null && item.trans_item_id != '';
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
      queryParams: item,
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

  openTransactionGroup(transaction: Transaction) {
    const transId = transaction.id;
    this.router.navigate(['/transaction-group', transId]);
  }

  raiseReturn(item: any) {
    if (item.is_return_order == '1') {
      return;
    }
    this.selectedRecord = item;
    this.modalTitle = "Raise Return for " + item.description;
    this.modalBody = "You are about to raise return for " + item.description + ". Do you want to continue ?";
    this.modalBtnName = 'Raise Return Order';
    this.confirmData = {
      type: 'RAISE_RETURN',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  markReturned(item: any) {
    this.selectedRecord = item;
    this.modalTitle = "Mark " + item.description + " as Returned";
    this.modalBody = "You are about to mark " + item.description + " as returned. Do you want to continue ?";
    this.modalBtnName = 'Returned';
    this.confirmData = {
      type: 'RETURNED',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  addRefundTransaction(item: Transaction) {
    let inputData: SaveTransaction = {};
    inputData.acc_id = item.acc_id;
    inputData.user_id = item.user_id;
    inputData.amount = this.utilService.formatStringValueToAmount(item.amount).toString();
    inputData.type = item.transType!.toUpperCase() == 'DEBIT' ? 'CREDIT' : 'DEBIT';
    inputData.desc = 'Refund for ' + item.description;
    let refundDate = new Date();
    refundDate.setDate(refundDate.getDate() + 1);
    inputData.date = this.utilService.convertDate(refundDate.toISOString().split('T')[0]);
    inputData.is_delivery_order = '0';
    inputData.is_delivered = '0';

    this.apiService.saveTransaction(inputData).subscribe({
      next: (resp: any) => {
        if (resp.success !== true) {
          this.utilService.showAlert("Some error occurred while saving. Please try again.");
        }
      },
      error: (err) => {
        console.error("Error -> " + err);
        this.utilService.showAlert("Error Occurred while Saving ! Please try again.");
      }
    });
  }
}
