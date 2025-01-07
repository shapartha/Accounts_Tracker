import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-redeem-eq',
  standalone: true,
  imports: [MatFormFieldModule, MatDatepickerModule, NativeDateModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './redeem-eq.component.html',
  styleUrl: './redeem-eq.component.scss'
})
export class RedeemEqComponent {

  form: FormGroup;
  blockFutureDates = new Date();

  @Input() eqData: any;
  @Output() formData: EventEmitter<any> = new EventEmitter();

  constructor(private fb: FormBuilder, public utilService: UtilService) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      rdmAmt: [{ value: this.utilService.roundUpAmount(this.eqData.no_of_shares * this.utilService.formatStringValueToAmount(this.eqData.current_market_price)), disabled: true }],
      rdmNoOfShares: [{ value: this.eqData.no_of_shares, disabled: (this.eqData.redeemType == 'Fully') }],
      rdmCMP: [this.utilService.formatStringValueToAmount(this.eqData.current_market_price)],
      rdmDte: [new Date()]
    });
    this.formData.emit(this.form.getRawValue());
    this.form.valueChanges.subscribe(val => {
      val['valid'] = this.form.valid;
      val['rdmNoOfShares'] = this.form.getRawValue().rdmNoOfShares;
      val['rdmAmt'] = this.form.getRawValue().rdmAmt;
      this.formData.emit(val);
    });
  }

  onChangeRedeemVal() {
    let data = this.form.getRawValue();
    if (isNaN(data.rdmNoOfShares) || isNaN(data.rdmCMP)) {
      return;
    }
    this.form.get('rdmAmt')?.setValue(this.utilService.roundUpAmt(data.rdmNoOfShares * data.rdmCMP));
  }
}
