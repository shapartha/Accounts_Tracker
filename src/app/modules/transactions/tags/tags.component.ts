import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AddTagComponent } from './add-tag/add-tag.component';
import { UtilService } from 'app/services/util.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/services/api.service';
import { ConfirmData } from 'app/models/confirm';
import { ConfirmDialogComponent } from 'app/modules/modals/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [MatIconModule, CommonModule, AddTagComponent, ConfirmDialogComponent],
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.scss'
})
export class TagsComponent implements OnInit {

  tags: any[] = [];
  addUpdateTag: any;
  modifiedRecord: any = {};
  modalRef: any;
  isUpdate: boolean = false;

  selectedRecord: any;
  canClose: boolean = false;
  modalTitle: string = '';
  modalBody: string = '';
  confirmData: ConfirmData = {} as any;
  modalBtnName: string = '';

  constructor(public utilService: UtilService, private modalService: NgbModal, private apiService: ApiService) { }

  ngOnInit(): void {
    this.fetchAllTags();
  }

  fetchAllTags() {
    this.apiService.getAllTags().subscribe({
      next: (resp: any) => {
        if (resp.success == true && resp.response == '200') {
          this.tags = [];
          resp.dataArray.forEach((element: any) => {
            this.tags.push({
              tagId: element.tag_id,
              tagName: element.tag_name
            });
          });
        } else {
          this.utilService.showAlert(resp);
        }
      }, error: err => {
        this.utilService.showAlert(err);
      }
    });
  }

  addTag(content: TemplateRef<any>) {
    this.addUpdateTag = null;
    this.isUpdate = false;
    this.modalRef = this.modalService.open(content,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        fullscreen: 'md',
        scrollable: true,
        size: 'lg'
      });
  }

  editTag(content: TemplateRef<any>, data: any) {
    this.addUpdateTag = data;
    this.isUpdate = true;
    this.modalRef = this.modalService.open(content,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        fullscreen: 'md',
        scrollable: true,
        size: 'lg'
      });
  }

  deleteTagConfirm(evt: any) {
    this.selectedRecord = evt;
    this.modalTitle = "Delete this tag - " + this.selectedRecord.tagName + " ?";
    this.modalBody = "You're about to delete this tag. Are you sure you want to proceed ?";
    this.modalBtnName = 'Delete';
    this.confirmData = {
      type: 'DELETE-TAG',
      value: false
    };
    this.canClose = false;
    const confirmBtn = document.getElementById('confirmBtn') as HTMLElement;
    confirmBtn.click();
  }

  deleteTag(data: any) {
    let inputs = {
      tag_id: data.tagId
    };
    this.apiService.deleteTag([inputs]).subscribe({
      next: (resp: any) => {
        if (resp[0].success == true && resp[0].response == '200') {
          this.apiService.deleteTransactionMappingForTagId([{ tag_id: data.tagId }]).subscribe({
            next: (innerResp: any) => {
              if (innerResp[0].success != true || innerResp[0].response != '200') {
                this.utilService.showAlert(innerResp);
              } else {
                this.utilService.showAlert('Tag deleted successfully', 'success');
                this.canClose = true;
                this.fetchAllTags();
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
    });
  }

  updatedRecord(event: any) {
    this.modifiedRecord.tagId = event.tagId;
    this.modifiedRecord.tagName = event.tagName;
    this.modifiedRecord.isValid = event.valid;
  }

  confirm(evt: ConfirmData) {
    if (evt.type == 'DELETE-TAG' && evt.value == true) {
      this.deleteTag(this.selectedRecord);
    }
  }

  saveOrUpdate(item: any) {
    if (item.isValid == null) {
      this.utilService.showAlert("Nothing to update here since NO changes are made");
      return;
    } else if (item.isValid == true) {
      if (item.tagName == undefined || item.tagName?.length! < 3) {
        this.utilService.showAlert("Tag Name must be atleast 3 characters");
        return;
      }
      let inputAddTag: any[] = [];
      if (item.tagName.indexOf(",") == -1) {
        inputAddTag.push({
          tag_name: item.tagName.trim()
        });
      } else {
        let tags = item.tagName.split(",");
        tags.forEach((element: any) => {
          inputAddTag.push({
            tag_name: element.trim()
          });
        });
      }
      if (this.isUpdate) {
        inputAddTag = [{
          tag_id: item.tagId,
          tag_name: item.tagName
        }];
      }
      this.apiService.saveOrUpdateTag(inputAddTag, this.isUpdate).subscribe({
        next: (resp: any) => {
          if (resp[0].success && resp[0].response == '200') {
            if (this.isUpdate) {
              this.utilService.showAlert("Tag updated successfully", 'success');
            } else {
              this.utilService.showAlert("Tag added successfully", 'success');
            }
            this.modalRef.close('Save clicked');
            this.fetchAllTags();
          } else {
            this.utilService.showAlert(resp);
          }
        }, error: err => {
          this.utilService.showAlert(err);
        }
      });
    } else {
      this.utilService.showAlert('One or more form fields are invalid');
    }
  }
}
