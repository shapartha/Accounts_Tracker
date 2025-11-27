import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConstants } from 'app/const/app.constants';
import { ConfirmData } from 'app/models/confirm';
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [MatInputModule, FormsModule, CommonModule, ReactiveFormsModule, MatIconModule, ConfirmDialogComponent],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.scss'
})
export class GroupsComponent implements OnInit {
  transId: string | null = null;
  transactionData: any;
  transGroupItems: any[] = [];
  numItems: number = 1;
  currency = AppConstants.RUPEE_SYMBOL;
  form!: FormGroup
  selectedRecord: any;
  canClose: boolean = false;
  modalTitle: string = '';
  modalBody: string = '';
  confirmData: ConfirmData = {} as any;
  modalBtnName: string = '';

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private utilService: UtilService, private apiService: ApiService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      this.transId = pm.get('transId');
      this.apiService.getTransactionById({ trans_id: this.transId }).subscribe(response => {
        const trans = response.dataArray[0];
        trans.trans_amount = this.utilService.formatAmountWithComma((Math.round(trans.trans_amount! * 100) / 100).toFixed(2))
        this.transactionData = trans;

        this.apiService.getTransactionGroupItems({ trans_id: this.transId }).subscribe(response => {
          console.log('Group Items:', response.dataArray);
          this.transGroupItems = response.dataArray || [];
          this.reInitForm();
        });

        this.reInitForm();
      });

      this.form = this.fb.group({
        items: this.fb.array([
          this.fb.group({
            itemDesc: ['', Validators.required],
            itemAmount: [0, Validators.required]
          })
        ])
      });
    });
  }

  reInitForm(): void {
    this.form = this.fb.group({
      items: (this.transGroupItems.length > 0) ? this.fb.array(this.getInitialItems(this.transGroupItems)) : this.fb.array(this.getInitialItems(this.transactionData))
    }, { validators: [this.totalAmountValidator(this.utilService.formatStringValueToAmount(this.transactionData.trans_amount)), this.minItemsValidator(2)] });
  }

  getInitialItems(transData: any): FormGroup[] {
    if (!Array.isArray(transData)) {
      this.numItems = 1;
      return [
        this.createItem(transData)
      ];
    } else {
      this.numItems = transData.length;
      return transData.map((trans: any) => {
        var item = {
          trans_item_id: trans.trans_item_id,
          trans_desc: trans.trans_item_desc,
          trans_amount: trans.trans_item_amount,
          is_delivered: trans.is_delivered,
          is_delivery_order: trans.is_delivery_order,
          is_returned: trans.is_returned,
          is_return_order: trans.is_return_order
        };
        return this.createItem(item);
      });
    }
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  createItem(transactionData: any = {}): FormGroup {
    return this.fb.group({
      itemId: [transactionData.trans_item_id || null],
      itemDesc: [transactionData.trans_desc, Validators.required],
      itemAmount: [(transactionData.trans_amount?.indexOf(AppConstants.RUPEE_SYMBOL) == -1) ? transactionData.trans_amount : this.utilService.formatStringValueToAmount(transactionData.trans_amount), [Validators.required, Validators.min(1)]],
      isDelivered: [transactionData.is_delivered || '0'],
      isDeliveryOrder: [transactionData.is_delivery_order || '0'],
      isReturned: [transactionData.is_returned || '0'],
      isReturnOrder: [transactionData.is_return_order || '0']
    });
  }

  splitItems(): void {
    var transactionData = {
      is_delivered: this.transactionData.is_delivered || '0',
      is_delivery_order: this.transactionData.is_delivery_order || '0',
      is_returned: this.transactionData.is_returned || '0',
      is_return_order: this.transactionData.is_return_order || '0'
    };
    if (this.numItems > this.items.length) {
      for (let i = this.items.length; i < this.numItems; i++) {
        this.items.push(this.createItem(transactionData));
        this.form.updateValueAndValidity();
      }
    } else if (this.numItems < this.items.length) {
      for (let i = this.items.length; i > this.numItems; i--) {
        this.items.removeAt(i - 1);
        this.form.updateValueAndValidity();
      }
    }
  }

  removeItem(item: any, index: number): void {
    if (this.numItems <= 1) {
      this.utilService.showAlert('At least one item is required.');
      return;
    }
    this.selectedRecord = {
      index: index,
      data: item.value
    };
    this.modalTitle = "Delete " + item.value.itemDesc;
    this.modalBody = "You are about to delete " + item.value.itemDesc + ". Do you want to continue ?";
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
      if (this.selectedRecord.data.itemId == null) {
        this.canClose = true;
        this.items.removeAt(this.selectedRecord.index);
        this.form.updateValueAndValidity();
        if (this.numItems > 0) {
          this.numItems--;
        }
        return;
      }
      this.apiService.deleteTransactionGroupItem([{ trans_item_id: this.selectedRecord.data.itemId }]).subscribe(response => {
        this.utilService.showAlert('Item deleted successfully', 'success');
        this.canClose = true;
        this.items.removeAt(this.selectedRecord.index);
        this.form.updateValueAndValidity();
        if (this.numItems > 0) {
          this.numItems--;
        }
      });
    } else if (evt.type == 'DELIVERED' && evt.value == true) {
      const item = this.selectedRecord.data;
      this.updateItemStatus(item, 1, 0, 0);
      this.canClose = true;
    } else if (evt.type == 'RAISE_RETURN' && evt.value == true) {
      const item = this.selectedRecord.data;
      this.updateItemStatus(item, 1, 1, 0);
      this.canClose = true;
    } else if (evt.type == 'RETURNED' && evt.value == true) {
      const item = this.selectedRecord.data;
      this.updateItemStatus(item, 1, 1, 1);
      this.canClose = true;
    }
  }

  private totalAmountValidator(maxTotal: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control.get('items') as FormArray;
      if (!arr) return null;
      const sum = arr.controls.reduce((s, g) => s + Number(g.get('itemAmount')?.value || 0), 0);
      return sum != maxTotal ? { totalExceeded: { max: maxTotal, sum } } : null;
    };
  }

  private minItemsValidator(minCount: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control.get('items') as FormArray;
      if (!arr) return null;
      return arr.length < minCount ? { minItems: { min: minCount, actual: arr.length } } : null;
    };
  }

  saveItems(apiSavePayload: any[], apiUpdatePayload: any[]): void {
    if (apiSavePayload.length > 0) {
      this.apiService.saveTransactionGroupItems(apiSavePayload).pipe(
        map((resp: any) => ({
          hasSuccess: Array.isArray(resp) && resp.some(item => item?.success === true),
          response: resp
        }))
      ).subscribe({
        next: (resp: any) => {
          if (resp.hasSuccess) {
            if (apiUpdatePayload.length > 0) {
              this.apiService.updateTransactionGroupItems(apiUpdatePayload).pipe(
                map((resp: any) => ({
                  hasSuccess: Array.isArray(resp) && resp.some(item => item?.success === true),
                  response: resp
                }))
              ).subscribe({
                next: (response2: any) => {
                  if (response2.hasSuccess) {
                    console.log('Update Existing Items Response:', response2);
                    this.utilService.showAlert('Group items saved successfully', 'success');
                    this.router.navigate(['/all-transactions']);
                  } else {
                    this.utilService.showAlert('Error updating group items. Please try again later.');
                  }
                },
                error: (err2: any) => {
                  console.error('Error updating group items:', err2);
                  this.utilService.showAlert('Error updating group items. Please try again later.');
                }
              });
            } else {
              this.utilService.showAlert('Group items saved successfully', 'success');
              this.router.navigate(['/all-transactions']);
            }
          } else {
            this.utilService.showAlert('Error saving group items. Please try again later.');
          }
        },
        error: (err: any) => {
          console.error('Error saving group items:', err);
          this.utilService.showAlert('Error saving group items. Please try again later.');
        }
      });
    } else if (apiUpdatePayload.length > 0) {
      this.apiService.updateTransactionGroupItems(apiUpdatePayload).pipe(
        map((resp: any) => ({
          hasSuccess: Array.isArray(resp) && resp.some(item => item?.success === true),
          response: resp
        }))
      ).subscribe(response => {
        if (response.hasSuccess) {
          console.log('Update Existing Items Response:', response);
          this.utilService.showAlert('Group items saved successfully', 'success');
          this.router.navigate(['/all-transactions']);
        } else {
          this.utilService.showAlert('Error updating group items. Please try again later.');
        }
      });
    }
  }

  updateItemStatus(item: any, isDelivered: number, isReturnOrder: number, isReturned: number): void {
    let apiPayload = [];
    apiPayload.push(
      {
        trans_id: this.transId,
        trans_item_id: item.value.itemId,
        is_delivered: isDelivered,
        is_returned: isReturned,
        is_return_order: isReturnOrder
      }
    );
    this.apiService.updateTransactionGroupItems(apiPayload).pipe(
      map((resp: any) => ({
        hasSuccess: Array.isArray(resp) && resp.some(item => item?.success === true),
        response: resp
      }))
    ).subscribe(response => {
      if (response.hasSuccess) {
        item.get('isDelivered')?.setValue(isDelivered.toString());
        item.get('isReturnOrder')?.setValue(isReturnOrder.toString());
        item.get('isReturned')?.setValue(isReturned.toString());
        this.router.navigate(['/transaction-group/' + this.transId]);
      } else {
        this.utilService.showAlert('Error updating group items. Please try again later.');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    } else if (this.form.valid) {
      const payload = this.form.get('items')?.value;
      let apiPayload = [];
      for (var item of payload) {
        apiPayload.push(
          {
            trans_id: this.transId,
            trans_item_id: item.itemId,
            trans_item_desc: item.itemDesc,
            trans_item_amount: item.itemAmount,
            is_delivered: item.isDelivered,
            is_delivery_order: item.isDeliveryOrder,
            is_returned: item.isReturned,
            is_return_order: item.isReturnOrder
          }
        );
      }
      var apiSavePayload = apiPayload.filter((item: any) => item.trans_item_id == null);
      var apiUpdatePayload = apiPayload.filter((item: any) => item.trans_item_id != null);
      this.saveItems(apiSavePayload, apiUpdatePayload);
    }
  }

  markDelivered(item: any, index: number) {
    this.selectedRecord = {
      index: index,
      data: item
    };
    this.modalTitle = "Mark " + item.value.itemDesc + " as Delivered";
    this.modalBody = "You are about to mark " + item.value.itemDesc + " as order delivered. Do you want to continue ?";
    this.modalBtnName = 'Delivered';
    this.confirmData = {
      type: 'DELIVERED',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  raiseReturn(item: any, index: number) {
    this.selectedRecord = {
      index: index,
      data: item
    };
    this.modalTitle = "Raise Return for " + item.value.itemDesc;
    this.modalBody = "You are about to raise return for " + item.value.itemDesc + ". Do you want to continue ?";
    this.modalBtnName = 'Raise Return Order';
    this.confirmData = {
      type: 'RAISE_RETURN',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  markReturned(item: any, index: number) {
    this.selectedRecord = {
      index: index,
      data: item
    };
    this.modalTitle = "Mark " + item.value.itemDesc + " as Returned";
    this.modalBody = "You are about to mark " + item.value.itemDesc + " as returned. Do you want to continue ?";
    this.modalBtnName = 'Returned';
    this.confirmData = {
      type: 'RETURNED',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }
}
