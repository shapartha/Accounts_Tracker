import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, EventEmitter, inject, Input, model, OnDestroy, OnInit, Output, signal, ViewChild, WritableSignal } from '@angular/core';
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
import { map, startWith } from 'rxjs';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-update-transaction',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, MatToolbarModule, MatChipsModule, MatAutocompleteModule, MatIconModule],
  templateUrl: './update-transaction.component.html',
  styleUrl: './update-transaction.component.scss'
})
export class UpdateTransactionComponent implements OnInit, OnDestroy {

  form: FormGroup;
  fileUploadMessage: string = '';
  fileName = 'Replace file';
  fileType: any;
  currentFile: any;
  newPreviewUrl: any;
  fileBitmap: any;
  isReceiptPdf: boolean = false;

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
      isPdf: ['N'],
      currentTag: [this.currentTag]
    });
  }
  ngOnDestroy(): void {
    this.stopCamera();
  }

  ngOnInit(): void {
    let prevUrl = null;
    if (this.updateTransaction.receiptImgId != null && this.updateTransaction.receiptImgId != undefined && this.updateTransaction.receiptImgId != 0) {
      this.apiService.getReceiptImage({ "receipt_uid": this.updateTransaction.receiptImgId }).subscribe({
        next: (resp: any) => {
          let _bitmap_data = resp.dataArray[0].bitmap_data;
          this.currentFile = _bitmap_data;
          if (_bitmap_data.startsWith('data:application/pdf')) {
            this.isReceiptPdf = true;
          }
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
      isPdf: [this.isReceiptPdf ? 'Y' : 'N'],
      currentTag: [this.currentTag]
    });
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
      setTimeout(() => {
        this.tagChanges.new = this.tags().map(tag => tag.tagId);
        val['valid'] = this.form.valid;
        val['tagChanges'] = this.tagChanges;
        this.formData.emit(val);
      }, 300);
    });
  }

  private _filter(value: any): string[] {
    const filterValue = value.tagName?.toLowerCase() || value?.toLowerCase();
    return this.allTags.filter(option => option.tagName.toLowerCase().includes(filterValue));
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
    return finalImage;
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
      const compressed = await this.compressFile(dataUrl);
      this.capturedImage.set(compressed);
      this.saveCroppedImage();
    }
  }

  saveCroppedImage(): void {
    const croppedData = this.capturedImage();
    this.croppedImages.push(croppedData);
    this.form.get('imageUpdated')?.setValue(true);
    this.capturedImage.set('');

    /** below code to setup data for upload new receipt */

    let isPdf: string = 'N';
    if (this.croppedImages.length > 1) {
      this.saveAllAsPdf();
      isPdf = 'Y';
    } else {
      this.form.get('fileBitmap')?.setValue(this.croppedImages[0]);
    }
    this.form.get('isPdf')?.setValue(isPdf);
  }

  saveAllAsPdf(): void {
    if (this.croppedImages.length === 0) return;

    const pdf = new jsPDF();
    this.croppedImages.forEach((img, index) => {
      if (index !== 0) pdf.addPage();
      pdf.addImage(img, 'JPEG', 10, 10, 190, 277); // Fit A4 page
    });
    const base64String = pdf.output('datauristring').split(',')[1];
    this.form.get('fileBitmap')?.setValue(base64String);
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
          this.form.get('currentTag')?.setValue('');
          document.getElementsByName('currentTag').forEach((item: any) => {
            item.value = '';
          });
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
    this.form.get('currentTag')?.setValue('');
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
