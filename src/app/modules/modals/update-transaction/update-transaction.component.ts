import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  selector: 'app-update-transaction',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatToolbarModule],
  templateUrl: './update-transaction.component.html',
  styleUrl: './update-transaction.component.scss'
})
export class UpdateTransactionComponent implements OnInit {

  form: FormGroup;
  fileUploadMessage: string = '';
  fileName = 'Replace file';
  fileType: any;
  currentFile: any;
  newPreviewUrl: any;
  fileBitmap: any;

  @Input() updateTransaction: any;
  @Output() formData: EventEmitter<any> = new EventEmitter();

  constructor(private fb: FormBuilder, public utilService: UtilService, private domSanitizer: DomSanitizer, private apiService: ApiService, private imageCompress: NgxImageCompressService) {
    this.form = this.fb.group({
      amount: [],
      transDesc: [],
      transDate: [],
      imageId: [],
      previewUrl: [],
      transId: [],
      imageUpdated: [],
      fileBitmap: []
    });
  }

  ngOnInit(): void {
    let prevUrl = null;
    if (this.updateTransaction.receiptImgId != null && this.updateTransaction.receiptImgId != undefined && this.updateTransaction.receiptImgId != 0) {
      this.apiService.getReceiptImage({ "receipt_uid": this.updateTransaction.receiptImgId }).subscribe({
        next: (resp: any) => {
          let _bitmap_data = resp.dataArray[0].bitmap_data;
          prevUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(_bitmap_data);
          this.form.get('previewUrl')?.setValue(prevUrl);
        }, error: (err) => {
          console.error(err);
          this.utilService.showAlert("Error retrieving receipt image : " + JSON.stringify(err));
        }
      });
    }
    this.form = this.fb.group({
      amount: [{ value: this.updateTransaction.amount, disabled: true }],
      transDesc: [this.updateTransaction.description],
      transDate: [this.utilService.getDate(this.updateTransaction.date)],
      imageId: [this.updateTransaction.receiptImgId],
      previewUrl: [prevUrl],
      transId: [this.updateTransaction.id],
      imageUpdated: [false],
      fileBitmap: []
    });
    this.formData.emit(this.form.value);
    this.form.valueChanges.subscribe(val => {
      val['valid'] = this.form.valid;
      this.formData.emit(val);
    });
  }

  selectFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      this.currentFile = file;
      this.fileName = this.currentFile.name;
      this.form.get('imageUpdated')?.setValue(true);
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
      this.fileName = 'Replace File';
      this.newPreviewUrl = null;
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
    this.newPreviewUrl = finalImage;
    this.fileBitmap = finalImage;
    this.form.get('fileBitmap')?.setValue(this.fileBitmap);
  }
}
