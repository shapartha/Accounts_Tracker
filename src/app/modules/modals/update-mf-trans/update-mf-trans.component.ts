import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-update-mf-trans',
  standalone: true,
  imports: [MatFormFieldModule, MatDatepickerModule, NativeDateModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './update-mf-trans.component.html',
  styleUrl: './update-mf-trans.component.scss'
})
export class UpdateMfTransComponent {
  form: FormGroup;
  blockFutureDates = new Date();

  @Input() mfData: any;
  @Output() formData: EventEmitter<any> = new EventEmitter();

  constructor(private fb: FormBuilder, public utilService: UtilService) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      invAmt: [{ value: this.mfData.amount, disabled: true }],
      transDate: [new Date(this.mfData.trans_date)],
      nav: [this.mfData.nav],
      balanceUnits: [this.mfData.balance_units],
      units: [this.mfData.units]
    });

    this.formData.emit(this.form.getRawValue());
    this.form.valueChanges.subscribe(val => {
      val['valid'] = this.form.valid;
      val['invAmt'] = this.form.getRawValue().invAmt;
      this.formData.emit(val);
    });
  }

  onChangeUnitsVal(val = null) {
    let data = this.form.getRawValue();
    this.form.get('nav')?.setValue(this.utilService.roundUpAmt(Number(data.invAmt) / Number((val == null) ? data.units : val)));
  }

  onChangeNavVal(val = null) {
    let data = this.form.getRawValue();
    this.form.get('units')?.setValue(this.utilService.roundUpAmt(Number(data.invAmt) / Number((val == null) ? data.nav : val)));
  }
}
