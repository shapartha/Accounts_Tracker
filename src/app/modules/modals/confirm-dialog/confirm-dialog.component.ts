import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ConfirmData } from 'app/models/confirm';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent implements OnChanges {
  @Input() modalTitle = 'Confirm';
  @Input() modalBody = 'Do you want to continue ?';
  @Output() onConfirmSubmit: EventEmitter<ConfirmData> = new EventEmitter();
  @Input() confirmObj: ConfirmData = {} as any;
  @Input() canClose: boolean = false;
  @Input() modalMainButton = 'Confirm';

  submit() {
    this.confirmObj.value = true;
    this.onConfirmSubmit.emit(this.confirmObj);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['canClose'] != null && changes['canClose'].previousValue == false && changes['canClose'].currentValue == true) {
      const closeBtn = document.getElementById('closeConfirmDialog') as HTMLElement;
      closeBtn.click();
    }
  }
}
