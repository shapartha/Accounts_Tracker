import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-add-tag',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './add-tag.component.html',
  styleUrl: './add-tag.component.scss'
})
export class AddTagComponent implements OnInit {

  form: FormGroup;

  @Input() addUpdateTag: any;
  @Output() formData: EventEmitter<any> = new EventEmitter();

  constructor(private fb: FormBuilder, public utilService: UtilService, private apiService: ApiService) {
    this.form = this.fb.group({
      tagId: [],
      tagName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.addUpdateTag != null) {
      this.form = this.fb.group({
        tagId: [this.addUpdateTag.tagId],
        tagName: [this.addUpdateTag.tagName, Validators.required]
      });
    }
    this.formData.emit(this.form.value);
    this.form.valueChanges.subscribe(val => {
      val['valid'] = this.form.valid;
      this.formData.emit(val);
    });
  }
}
