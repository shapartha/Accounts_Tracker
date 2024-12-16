import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SaveTransaction } from 'app/models/transaction';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { Account } from 'app/models/account';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  selector: 'app-add-update-transaction',
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, FormsModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatSelectModule, MatToolbarModule, CommonModule, MatInputModule, MatSlideToggleModule],
  providers: [NgxImageCompressService],
  templateUrl: './add-update-transaction.component.html',
  styleUrl: './add-update-transaction.component.scss'
})
export class AddUpdateTransactionComponent implements OnInit {

  form: FormGroup;
  isMf: boolean = false;
  selectedMfNavDate = "";
  mainAccList: Account[] = [];
  fromAcc: Account[] = [];
  toAcc: Account[] = [];
  fromAccBalance: string = "";
  toAccBalance: string = "";
  mfSchemes: any[] = [];
  isValid: boolean = true;
  monthDays: number[] = [];
  currentFile?: File;
  fileUploadMessage = '';
  fileName = 'Select File';
  isGoBack: boolean = false;
  saveTransaction: SaveTransaction = {};
  saveTransactionTrans: SaveTransaction = {};
  previewUrl: any;
  fileBitmap: any;
  fileType: any;

  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService, private utilService: UtilService, private imageCompress: NgxImageCompressService) {
    this.form = this.fb.group({});
    if (this.router.getCurrentNavigation()?.extras.state != null) {
      let objQueryParams = this.router.getCurrentNavigation()!.extras.state;
      if (objQueryParams != undefined) {
        objQueryParams = objQueryParams['queryParams'];
        this.form = this.fb.group({
          amount: [this.utilService.formatStringValueToAmount(objQueryParams!['amount'])],
          description: [objQueryParams!['description'], Validators.minLength(3)],
          transDate: [this.utilService.getDate(objQueryParams!['date'])],
          isTransferTrans: [false],
          transType: [objQueryParams!['transType']],
          fromAccDetails: [objQueryParams!['acc_id']],
          toAccDetails: [],
          mfSchemeCode: [],
          mfNav: [],
          isRecurringTrans: [false],
          reccDate: []
        });
      }
    } else {
      this.form = this.fb.group({
        amount: [],
        description: ['', Validators.minLength(3)],
        transDate: [this.utilService.getDate()],
        isTransferTrans: [false],
        transType: ['DEBIT'],
        fromAccDetails: [],
        toAccDetails: [],
        mfSchemeCode: [],
        mfNav: [],
        isRecurringTrans: [false],
        reccDate: []
      });
    }
  }

  ngOnInit(): void {
    this.form.get('isTransferTrans')?.valueChanges.subscribe(data => {
      this.onChangeTransferTrans(data);
    });
    this.form.get('isRecurringTrans')?.valueChanges.subscribe(data => {
      this.onChangeRecurringTrans(data);
    });
    for (var i = 1; i <= 28; i++) {
      this.monthDays.push(i);
    }
    this.loadAccounts();
  }

  loadAccounts() {
    let inputParams = { user_id: this.utilService.appUserId };
    this.apiService.getAllAccounts(inputParams).subscribe({
      next: (data) => {
        data.dataArray.forEach((element: any) => {
          if (element.is_equity == false) {
            let _acc: Account = {};
            _acc.id = element.account_id;
            _acc.name = element.account_name;
            _acc.balance = element.balance;
            _acc.category_id = element.category_id;
            _acc.category_name = element.category_name;
            _acc.created_date = element.created_date;
            _acc.is_equity = element.is_equity;
            _acc.is_mf = element.is_mf;
            _acc.updated_date = element.updated_date;
            _acc.user_id = element.user_id;
            this.fromAcc.push(_acc);
          }
        });
        this.mainAccList = this.fromAcc.map(obj => ({ ...obj }));
        this.toAcc = this.fromAcc.map(obj => ({ ...obj }));
        setTimeout(() => {
          if (this.form.get('fromAccDetails')?.value != null) {
            let selectedAcc = this.mainAccList.filter((_acc: any) => _acc.id === this.form.get('fromAccDetails')?.value)[0];
            this.fromAccBalance = this.utilService.formatAmountWithComma(selectedAcc.balance!);
          }
        }, 300);
      },
      error: (err) => {
        this.utilService.showAlert(err);
        console.error(err);
      }
    });
  }

  handleRoute(uri: string) {
    this.router.navigate([uri]);
  }

  onChangeFromAccount(_data: any) {
    let _frmAcc = this.mainAccList.find(_acc => _acc.id === _data.value)!;
    let _isThisMf = false;
    let _toAcc = this.mainAccList.find(_acc => _acc.id === this.form.get('toAccDetails')?.value);
    this.isMf = _frmAcc.is_mf == '1' || _toAcc?.is_mf == '1';
    if (_frmAcc == undefined) {
      return;
    }
    if (_frmAcc.is_mf == true) {
      _isThisMf = true;
      this.populateMfSchemes(_frmAcc.id);
    } else {
      _isThisMf = false;
    }
    this.toAcc = this.mainAccList.map(obj => ({ ...obj }));
    if (_isThisMf) {
      let filteredArr = this.toAcc.filter(_acc => _acc.is_mf === "1");
      filteredArr.forEach((element: any) => {
        let _spliceIdx = this.toAcc.findIndex(_acc => _acc.id === element.id);
        this.toAcc.splice(_spliceIdx, 1);
      });
    } else {
      let _spliceIdx = this.toAcc.findIndex(_acc => _acc.id === _frmAcc.id);
      this.toAcc.splice(_spliceIdx, 1);
    }
    this.showOrHideMfSelector(_isThisMf);
    let selectedAcc = this.mainAccList.filter((_acc: any) => _acc.id === this.form.get('fromAccDetails')?.value)[0];
    this.fromAccBalance = this.utilService.formatAmountWithComma(selectedAcc.balance!);
  }

  onChangeToAccount(_data: any) {
    let _toAcc = this.mainAccList.find(_acc => _acc.id === _data.value);
    let _isThisMf = false;
    let _frmAcc = this.mainAccList.find(_acc => _acc.id === this.form.get('fromAccDetails')?.value);
    this.isMf = _frmAcc?.is_mf == "1" || _toAcc?.is_mf == "1";
    if (_toAcc == undefined) {
      return;
    }
    if (_toAcc.is_mf == true) {
      _isThisMf = true;
      this.populateMfSchemes(_toAcc.id);
    } else {
      _isThisMf = false;
    }
    this.fromAcc = this.mainAccList.map(obj => ({ ...obj }));
    if (_isThisMf) {
      let filteredArr = this.fromAcc.filter(_acc => _acc.is_mf === "1");
      filteredArr.forEach((element: any) => {
        let _spliceIdx = this.fromAcc.findIndex(_acc => _acc.id === element.id);
        this.fromAcc.splice(_spliceIdx, 1);
      });
    } else {
      let _spliceIdx = this.fromAcc.findIndex(_acc => _acc.id === _toAcc.id);
      this.fromAcc.splice(_spliceIdx, 1);
    }
    this.showOrHideMfSelector(_isThisMf);
    let selectedAcc = this.mainAccList.filter((_acc: any) => _acc.id === this.form.get('toAccDetails')?.value)[0];
    this.toAccBalance = this.utilService.formatAmountWithComma(selectedAcc.balance!);
  }

  populateMfSchemes(_accId: any) {
    this.mfSchemes = [];
    let inputParams = { account_id: _accId };
    this.apiService.getMfSchemesByAccount(inputParams).subscribe({
      next: (data) => {
        data.dataArray.forEach((element: any) => {
          this.mfSchemes.push(element);
        });
      },
      error: (err) => {
        console.error(err);
        this.utilService.showAlert('Error loading Mutual Fund Schemes. Try refreshing the page.');
      }
    });
  }

  onChangeMfScheme(_data: any) {
    if (_data.value !== undefined) {
      let _selectedScheme = this.mfSchemes.find(obj => obj.scheme_code === _data.value);
      this.selectedMfNavDate = _selectedScheme?.nav_date;
      this.form.get('mfNav')?.setValue(_selectedScheme.nav_amt);
      if (_selectedScheme != null) {
        this.form.get('mfNav')?.setValidators([Validators.required]);
        this.form.get('mfNav')?.updateValueAndValidity();
      } else {
        this.form.get('mfNav')?.removeValidators([Validators.required]);
        this.form.get('mfNav')?.updateValueAndValidity();
      }
    }
  }

  selectFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      this.currentFile = file;
      this.fileName = this.currentFile.name;
      var reader = new FileReader();
      reader.onload = (event: any) => {
        var binaryString = event.target.result;
        this.compressFile(binaryString);
      }
      reader.readAsDataURL(file);
      this.fileType = file.type;
      this.fileUploadMessage = "File selected for uploading"
    } else {
      this.currentFile = undefined;
      this.fileName = 'Select File';
      this.previewUrl = null;
      this.fileType = null;
      this.fileUploadMessage = '';
    }
  }

  async compressFile(image: any) {
    var orientation = -1;
    var finalImage = image;
    if (this.imageCompress.byteCount(image) / 1024 > 60) {
      console.log("Before Size --- " + this.imageCompress.byteCount(image) / 1024);
      const result = await this.imageCompress.compressFile(image, orientation, 50, 50);
      console.log("After Size --- " + this.imageCompress.byteCount(result) / 1024);
      finalImage = result;
    }
    this.previewUrl = finalImage;
    this.fileBitmap = finalImage;
  }

  upload() {
    let _inpObj = {
      bitmap_data: this.fileBitmap,
      created_at: this.utilService.getDate()
    }
    this.apiService.uploadReceiptImage(_inpObj).subscribe({
      next: (data) => {
        this.saveTransaction.image_path = data.dataArray[0].receipt_id;
        if (this.form.get('isTransferTrans')?.value == true) {
          this.saveTransactionTrans.image_path = data.dataArray[0].receipt_id;
        }
        this.uploadWithoutImage();
      },
      error: (err) => {
        console.error("Error -> " + err);
        this.utilService.showAlert("Image Upload Failed due to Error");
      }
    });
  }

  uploadWithoutImage() {
    if (this.form.get('isTransferTrans')?.value == true) {
      this.invokeSaveTransactionApi(this.saveTransaction, true);
      this.invokeSaveTransactionApi(this.saveTransactionTrans);
    } else {
      this.invokeSaveTransactionApi(this.saveTransaction);
    }
  }

  validateForm(): any {
    return this.form.valid;
  }

  saveTrans(goBack = false) {
    this.isGoBack = goBack;
    this.saveTransaction = {};
    this.saveTransactionTrans = {};
    if (this.validateForm()) {
      if (this.form.get('isTransferTrans')?.value == true) {
        this.saveTransactionTrans.amount = this.form.get('amount')?.value;
        this.saveTransactionTrans.date = this.utilService.convertDate(this.form.get('transDate')?.value);
        this.saveTransactionTrans.desc = this.form.get('description')?.value;
        this.saveTransactionTrans.type = "CREDIT";
        this.form.get('transType')?.setValue("DEBIT");
        this.saveTransactionTrans.acc_id = this.form.get('toAccDetails')?.value;
        this.saveTransactionTrans.user_id = this.utilService.appUserId.toString();
        if (this.form.get('isRecurringTrans')?.value == true) {
          this.saveTransactionTrans.rec_date = this.form.get('reccDate')?.value;
        }
        if (this.isMf) {
          this.saveTransactionTrans.scheme_code = this.form.get('mfSchemeCode')?.value;
          this.saveTransactionTrans.mf_nav = this.form.get('mfNav')?.value;
        }
      }
      this.saveTransaction.amount = this.form.get('amount')?.value;
      this.saveTransaction.date = this.utilService.convertDate(this.form.get('transDate')?.value);
      this.saveTransaction.desc = this.form.get('description')?.value;
      this.saveTransaction.type = this.form.get('transType')?.value;
      this.saveTransaction.acc_id = this.form.get('fromAccDetails')?.value;
      this.saveTransaction.user_id = this.utilService.appUserId.toString();
      if (this.form.get('isRecurringTrans')?.value == true) {
        this.saveTransaction.rec_date = this.form.get('reccDate')?.value;
      }
      if (this.isMf) {
        this.saveTransaction.scheme_code = this.form.get('mfSchemeCode')?.value;
        this.saveTransaction.mf_nav = this.form.get('mfNav')?.value;
      }
      if (this.currentFile) {
        this.upload();
      } else {
        this.uploadWithoutImage();
      }
    }
  }

  invokeSaveTransactionApi(_inpData: any, isTrans: boolean = false) {
    let _formattedDateStr = _inpData.date.split("T")[0];
    _inpData.date = _formattedDateStr;
    this.apiService.saveTransaction(_inpData).subscribe({
      next: (resp: any) => {
        if (resp.success === true) {
          if (_inpData.type == "CREDIT") {
            if (this.form.get('isTransferTrans')?.value == true) {
              let newBalance = this.utilService.formatStringValueToAmount(this.toAccBalance) + parseFloat(this.form.get('amount')?.value);
              this.toAccBalance = this.utilService.formatAmountWithComma(newBalance);
            } else {
              let newBalance = this.utilService.formatStringValueToAmount(this.fromAccBalance) + parseFloat(this.form.get('amount')?.value);
              this.fromAccBalance = this.utilService.formatAmountWithComma(newBalance);
            }
          } else {
            let newBalance = this.utilService.formatStringValueToAmount(this.fromAccBalance) - parseFloat(this.form.get('amount')?.value);
            this.fromAccBalance = this.utilService.formatAmountWithComma(newBalance);
          }
          this.utilService.showAlert("Transaction Saved Successfully", "success");
          this.form.get('amount')?.reset();
          if (this.isGoBack) {
            this.handleRoute('home');
          }
        } else {
          this.utilService.showAlert("Some error occurred while saving. Please try again.");
        }
      },
      error: (err) => {
        console.error("Error -> " + err);
        this.utilService.showAlert("Error Occurred while Saving ! Please try again.");
      }
    });
  }

  onChangeTransferTrans(val: boolean) {
    if (!val) {
      this.fromAcc = this.mainAccList.map(obj => ({ ...obj }));
      this.toAcc = this.mainAccList.map(obj => ({ ...obj }));
      this.form.get('toAccDetails')?.setValue('');
      this.toAccBalance = "";
      this.form.get('toAccDetails')?.removeValidators([Validators.required]);
      this.form.get('toAccDetails')?.updateValueAndValidity();
    } else {
      this.form.get('toAccDetails')?.setValidators([Validators.required]);
      this.form.get('toAccDetails')?.updateValueAndValidity();
    }
    let frmAcc = this.mainAccList.find(acc => acc.id == this.form.get('fromAccDetails')?.value);
    let toAcc = this.mainAccList.find(acc => acc.id == this.form.get('toAccDetails')?.value);
    this.isMf = frmAcc?.is_mf == '1' || toAcc?.is_mf == '1';
  }

  onChangeRecurringTrans(val: boolean) {
    if (val) {
      this.form.get('reccDate')?.setValidators([Validators.required]);
      this.form.get('reccDate')?.updateValueAndValidity();
    } else {
      this.form.get('reccDate')?.removeValidators([Validators.required]);
      this.form.get('reccDate')?.updateValueAndValidity();
    }
  }

  showOrHideMfSelector(show: boolean = false) {
    if (show) {
      this.form.get('mfSchemeCode')?.setValidators([Validators.required]);
      this.form.get('mfSchemeCode')?.updateValueAndValidity();
    } else {
      this.form.get('mfSchemeCode')?.removeValidators([Validators.required]);
      this.form.get('mfSchemeCode')?.updateValueAndValidity();
    }
  }
}
