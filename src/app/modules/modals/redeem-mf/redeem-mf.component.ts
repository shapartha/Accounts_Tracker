import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-redeem-mf',
  standalone: true,
  imports: [MatFormFieldModule, MatDatepickerModule, NativeDateModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './redeem-mf.component.html',
  styleUrl: './redeem-mf.component.scss'
})
export class RedeemMfComponent implements OnInit {

  form: FormGroup;
  blockFutureDates = new Date();

  @Input() mfData: any;
  @Output() formData: EventEmitter<any> = new EventEmitter();

  constructor(private fb: FormBuilder, public utilService: UtilService) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      rdmAmt: [{ value: this.utilService.formatStringValueToAmount(this.mfData.curr_amt), disabled: (this.mfData.redeemType == 'Fully') }],
      rdmUnits: [{ value: this.mfData.units, disabled: true }],
      rdmNav: [this.mfData.nav_amt],
      rdmDte: [new Date(this.mfData.nav_date)]
    });
    this.formData.emit(this.form.getRawValue());
    this.form.valueChanges.subscribe(val => {
      val['valid'] = this.form.valid;
      val['rdmUnits'] = this.form.getRawValue().rdmUnits;
      this.formData.emit(val);
    });
  }

  onChangeRedeemVal() {
    let data = this.form.getRawValue();
    this.form.get('rdmUnits')?.setValue(this.utilService.formatStringValueToAmount(this.utilService.formatAmountWithComma((data.rdmAmt / data.rdmNav).toString())));
  }
}
