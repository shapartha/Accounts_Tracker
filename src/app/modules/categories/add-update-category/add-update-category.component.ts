import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';

@Component({
  selector: 'app-add-update-category',
  standalone: true,
  imports: [MatFormFieldModule, ReactiveFormsModule, FormsModule, CommonModule, MatInputModule],
  templateUrl: './add-update-category.component.html',
  styleUrl: './add-update-category.component.scss'
})
export class AddUpdateCategoryComponent implements OnInit {

  @Input() isUpdate: boolean = false;
  form: FormGroup;
  @Input() updateCategory: any;
  @Output() formData: EventEmitter<any> = new EventEmitter();

  constructor(private fb: FormBuilder, private apiService: ApiService, public utilService: UtilService, private router: Router) {
    this.form = this.fb.group({
      categoryId: [],
      categoryName: []
    });
  }

  ngOnInit(): void {
    if (this.isUpdate) {
      this.form = this.fb.group({
        categoryId: [this.updateCategory.id],
        categoryName: [this.updateCategory.name]
      });
    }
    this.formData.emit(this.form.value);
    this.form.valueChanges.subscribe(val => {
      val['valid'] = this.form.valid;
      this.formData.emit(val);
    });
  }

  handleRoute(path: string) {
    this.router.navigate([path]);
  }

  save() {
    let item = this.form.value;
    if (item.categoryName == undefined || item.categoryName?.length < 3) {
      this.utilService.showAlert("Category name must be atleast 3 characters");
      return;
    }
    let _category = {
      category_name: item.categoryName,
      user_id: this.utilService.appUserId
    };
    this.apiService.saveCategory([_category]).subscribe({
      next: (resp: any) => {
        if (resp[0].success === true) {
          this.utilService.showAlert('Category: ' + item.categoryName + ' created successfully', 'success');
          this.handleRoute('home');
        } else {
          this.utilService.showAlert(resp[0].responseDescription);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert('Some error occurred while saving category. Please contact admin');
      }
    });
  }
}
