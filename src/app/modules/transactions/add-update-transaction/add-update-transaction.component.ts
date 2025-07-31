import { Component, computed, ElementRef, EventEmitter, inject, Input, model, OnDestroy, OnInit, Output, signal, ViewChild, WritableSignal } from '@angular/core';
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
import { DomSanitizer } from '@angular/platform-browser';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatIconModule } from '@angular/material/icon';
import { map, startWith } from 'rxjs';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-add-update-transaction',
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, FormsModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatSelectModule, MatToolbarModule, CommonModule, MatInputModule, MatSlideToggleModule, MatChipsModule, MatAutocompleteModule, MatIconModule],
  templateUrl: './add-update-transaction.component.html',
  styleUrl: './add-update-transaction.component.scss'
})
export class AddUpdateTransactionComponent implements OnInit, OnDestroy {

  @Input() isUpdateScheduledTrans = false;
  @Input() updateScheduledTrans: any;
  @Output() formData: EventEmitter<any> = new EventEmitter();

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
  isReceiptPdf: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService, private domSanitizer: DomSanitizer, private utilService: UtilService) {
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
          reccDate: [],
          id: [],
          currentTag: [this.currentTag],
          isDeliveryOrder: [false],
          isDelivered: [false]
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
        reccDate: [],
        id: [],
        currentTag: [this.currentTag],
        isDeliveryOrder: [false],
        isDelivered: [false]
      });
    }
  }
  ngOnDestroy(): void {
    this.stopCamera();
  }

  ngOnInit(): void {
    if (this.isUpdateScheduledTrans) {
      if (this.updateScheduledTrans.trans_receipt_image_id != null && this.updateScheduledTrans.trans_receipt_image_id != undefined && this.updateScheduledTrans.trans_receipt_image_id != 0) {
        this.apiService.getReceiptImage({ "receipt_uid": this.updateScheduledTrans.trans_receipt_image_id }).subscribe({
          next: (resp: any) => {
            let _bitmap_data = resp.dataArray[0].bitmap_data;
            if (_bitmap_data.startsWith('data:application/pdf')) {
              this.isReceiptPdf = true;
            }
            this.currentFile = _bitmap_data;
            this.previewUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(_bitmap_data);
          }, error: (err) => {
            console.error(err);
            this.utilService.showAlert("Error retrieving receipt image : " + JSON.stringify(err));
          }
        });
      }
      this.form = this.fb.group({
        amount: [this.utilService.formatStringValueToAmount(this.updateScheduledTrans.trans_amount)],
        description: [this.updateScheduledTrans.trans_desc, Validators.minLength(3)],
        transDate: [this.utilService.getDate(this.updateScheduledTrans.trans_date)],
        isTransferTrans: [{ value: false, disabled: true }],
        transType: [{ value: this.updateScheduledTrans.trans_type, disabled: true }],
        fromAccDetails: [this.updateScheduledTrans.account_id],
        toAccDetails: [],
        mfSchemeCode: [this.updateScheduledTrans.scheme_code],
        mfNav: [this.updateScheduledTrans.mf_nav],
        isRecurringTrans: [{ value: (this.updateScheduledTrans.rec_date != null && this.updateScheduledTrans.rec_date != "") ? true : false, disabled: true }],
        reccDate: [this.updateScheduledTrans.rec_date],
        id: [this.updateScheduledTrans.trans_id],
        currentTag: [this.currentTag]
      });
    }
    this.form.get('isTransferTrans')?.valueChanges.subscribe(data => {
      this.onChangeTransferTrans(data);
    });
    this.form.get('isRecurringTrans')?.valueChanges.subscribe(data => {
      this.onChangeRecurringTrans(data);
    });
    this.form.get('isDeliveryOrder')?.valueChanges.subscribe(data => {
      if (!data) {
        this.form.get('isDelivered')?.setValue(false);
      }
    });
    for (var i = 1; i <= 28; i++) {
      this.monthDays.push(i);
    }
    this.loadAccounts();
    this.loadAllTags();

    this.form.get('currentTag')?.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    ).subscribe(val => {
      this.filteredTags = computed(() => {
        return val;
      });
    });

    this.formData.emit(this.form.value);
    this.form.valueChanges.subscribe(val => {
      val['valid'] = this.form.valid;
      this.formData.emit(val);
    });
  }

  private _filter(value: any): string[] {
    const filterValue = value.tagName?.toLowerCase() || value?.toLowerCase();
    return this.allTags.filter(option => option.tagName.toLowerCase().includes(filterValue));
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
            this.onChangeFromAccount({ value: this.form.get('fromAccDetails')?.value });
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

  toggleReceiptCaptureCanvas() {
    this.showCanvas = !this.showCanvas;
    if (this.showCanvas) {
      this.initializeCamera();
    } else {
      this.stopCamera();
    }
  }

  showCanvas: boolean = false;
  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  stream: MediaStream | null = null;
  croppedImages: string[] = [];

  capturedImage = signal<string>('');

  private async initializeCamera(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }

  private stopCamera(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  async captureImage(): Promise<void> {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      this.capturedImage.set(dataUrl);
      this.saveCroppedImage();
    }
  }

  saveCroppedImage(): void {
    const croppedData = this.capturedImage();
    this.croppedImages.push(croppedData);
    this.capturedImage.set('');
  }

  saveAllAsPdf(): void {
    if (this.croppedImages.length === 0) return;

    const pdf = new jsPDF();
    this.croppedImages.forEach((img, index) => {
      if (index !== 0) pdf.addPage();
      pdf.addImage(img, 'JPEG', 10, 10, 190, 277); // Fit A4 page
    });
    const base64String = pdf.output('datauristring').split(',')[1];
    this.fileBitmap = base64String;
    // pdf.save("scanned-images.pdf");
  }

  downloadReceiptPdf(): void {
    const link = document.createElement('a');
    link.href = '' + this.currentFile;
    link.download = "receipt.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  isMobileDevice(): boolean {
    return this.utilService.isMobile();
  }

  upload() {
    let isPdf: string = 'N';
    if (this.croppedImages.length > 1) {
      this.saveAllAsPdf();
      isPdf = 'Y';
    } else {
      this.fileBitmap = this.croppedImages[0];
    }
    let _inpObj = {
      bitmap_data: this.fileBitmap,
      is_pdf: isPdf,
      created_at: this.utilService.getDate()
    }
    this.apiService.uploadReceiptImage(_inpObj).subscribe({
      next: (data) => {
        this.saveTransaction.image_path = data.dataArray[0].receipt_id;
        if (this.form.get('isTransferTrans')?.value == true) {
          this.saveTransactionTrans.image_path = data.dataArray[0].receipt_id;
        }
        this.capturedImage.set('');
        this.croppedImages = [];
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
      this.invokeSaveTransactionApi(this.saveTransaction);
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
        this.saveTransactionTrans.is_delivery_order = this.form.get('isDeliveryOrder')?.value;
        this.saveTransactionTrans.is_delivered = this.form.get('isDelivered')?.value;
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
      this.saveTransaction.is_delivery_order = this.form.get('isDeliveryOrder')?.value;
      this.saveTransaction.is_delivered = this.form.get('isDelivered')?.value;
      if (this.form.get('isRecurringTrans')?.value == true) {
        this.saveTransaction.rec_date = this.form.get('reccDate')?.value;
      }
      if (this.isMf) {
        this.saveTransaction.scheme_code = this.form.get('mfSchemeCode')?.value;
        this.saveTransaction.mf_nav = this.form.get('mfNav')?.value;
      }
      if (this.croppedImages.length > 0) {
        this.upload();
      } else {
        this.uploadWithoutImage();
      }
    }
  }

  invokeSaveTransactionApi(_inpData: any) {
    let _formattedDateStr = _inpData.date.split("T")[0];
    _inpData.date = _formattedDateStr;
    this.apiService.saveTransaction(_inpData).subscribe({
      next: (resp: any) => {
        if (resp.success === true) {
          if (_inpData.type == "CREDIT") {
            if (this.form.get('isTransferTrans')?.value == true) {
              let newBalance = this.utilService.formatStringValueToAmount(this.toAccBalance) + parseFloat(_inpData.amount);
              this.toAccBalance = this.utilService.formatAmountWithComma(newBalance);
            } else {
              let newBalance = this.utilService.formatStringValueToAmount(this.fromAccBalance) + parseFloat(_inpData.amount);
              this.fromAccBalance = this.utilService.formatAmountWithComma(newBalance);
            }
          } else {
            let newBalance = this.utilService.formatStringValueToAmount(this.fromAccBalance) - parseFloat(_inpData.amount);
            this.fromAccBalance = this.utilService.formatAmountWithComma(newBalance);
          }
          if (this.tags().length > 0) {
            this.storeTagsMapping();
          }
          this.utilService.showAlert("Transaction Saved Successfully", "success");
          this.form.get('amount')?.reset();
          if (this.isGoBack) {
            this.handleRoute('all-transactions');
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

  storeTagsMapping() {
    let inputQuery = {
      exc_qry: 'SELECT MAX(trans_id) as trans_id FROM vw_transactions;'
    };
    this.apiService.executeQuery(inputQuery).subscribe({
      next: (resp: any) => {
        if (resp.success == true && resp.response == '200') {
          const transId = resp.dataArray[0].trans_id;
          let inputs = [];
          for (var i = 0; i < this.tags().length; i++) {
            inputs.push({
              trans_id: transId,
              tag_id: this.tags()[i].tagId
            });
          }
          this.apiService.saveTransTagMapping(inputs).subscribe({
            next: (resp: any) => {
              if (resp[0].success == true && resp[0].response == '200') {
                this.utilService.showAlert("Transaction and Tags Saved Successfully", "success");
              } else {
                this.utilService.showAlert(resp);
              }
            }, error: err => {
              this.utilService.showAlert(err);
            }
          });
        } else {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    })
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

  /**
   * 
   * Code below is for Mat Chips with Autocomplete
   * 
   */

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly currentTag = model({} as any);
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
            this.filteredTags = this.calculateFilteredTags();
          });
        } else {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  calculateFilteredTags() {
    return computed(() => {
      const currentTag = this.currentTag()?.tagName?.toLowerCase();
      let finalVal = currentTag ? this.allTags.filter(tag => tag?.tagName?.toLowerCase().includes(currentTag)) : this.allTags.slice();
      return finalVal;
    });
  }

  readonly announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    this.utilService.showAlert('Please select something from the list');
    return;
  }

  remove(tag: any): void {
    this.tags.update(tags => {
      const index = tags.indexOf(tag);
      if (index < 0) {
        return tags;
      }
      tags.splice(index, 1);
      this.announcer.announce(`Removed ${tag}`);
      this.allTags.push(tag);
      this.filteredTags = this.calculateFilteredTags();
      return [...tags];
    });
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.update(tags => [...tags, event.option.value]);
    this.allTags.splice(this.allTags.findIndex(idx => idx.tagId == event.option.value.tagId), 1);
    this.currentTag.set('');
    this.form.get('currentTag')?.setValue('');
    document.getElementsByName('currentTag').forEach((item: any) => {
      item.value = '';
    });
    event.option.deselect();
    this.filteredTags = this.calculateFilteredTags();
  }
}
