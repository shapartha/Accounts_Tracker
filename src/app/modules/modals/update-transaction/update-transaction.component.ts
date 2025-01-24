import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, model, OnInit, Output, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-update-transaction',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatToolbarModule, MatChipsModule, MatAutocompleteModule, MatIconModule],
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

  tagChanges = {
    existing: [] as any[],
    new: [] as any[]
  };

  constructor(private fb: FormBuilder, public utilService: UtilService, private domSanitizer: DomSanitizer, private apiService: ApiService, private imageCompress: NgxImageCompressService) {
    this.form = this.fb.group({
      amount: [],
      transDesc: [],
      transDate: [],
      imageId: [],
      previewUrl: [],
      transId: [],
      imageUpdated: [],
      fileBitmap: [],
      currentTag: [this.currentTag]
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
      fileBitmap: [],
      currentTag: [this.currentTag]
    });
    this.loadAllTags();

    this.formData.emit(this.form.value);
    this.form.valueChanges.subscribe(val => {
      setTimeout(() => {
        this.tagChanges.new = this.tags().map(tag => tag.tagId);
        val['valid'] = this.form.valid;
        val['tagChanges'] = this.tagChanges;
        this.formData.emit(val);
      }, 300);
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
          this.findExistingTags(this.form.get('transId')?.value);
        } else {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  findExistingTags(transId: any) {
    this.apiService.getTagsByTransId({ trans_id: transId }).subscribe({
      next: (resp: any) => {
        if (resp.success == true && resp.response == '200') {
          let existingTags: any[] = [];
          this.tagChanges.existing = [];
          resp.dataArray.forEach((element: any) => {
            existingTags.push({
              tagId: element.tag_id,
              tagName: this.allTags.find(tg => tg.tagId == element.tag_id).tagName
            });
            this.tagChanges.existing.push(element.tag_id);
            this.allTags.splice(this.allTags.findIndex(idx => idx.tagId == element.tag_id), 1);
          });
          this.tags.set(existingTags);
          this.currentTag.set('');
          this.filteredTags = this.calculateFilteredTags();
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
      return currentTag ? this.allTags.filter(tag => tag?.tagName?.toLowerCase().includes(currentTag)) : this.allTags.slice();
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
    this.form.get('currentTag')?.setValue(' ');
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.tags.update(tags => [...tags, event.option.value]);
    this.allTags.splice(this.allTags.findIndex(idx => idx.tagId == event.option.value.tagId), 1);
    this.currentTag.set('');
    event.option.deselect();
    this.filteredTags = this.calculateFilteredTags();
  }
}
