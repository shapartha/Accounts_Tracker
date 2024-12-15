import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCarousel, NgbCarouselModule, NgbModal, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { firstValueFrom } from 'rxjs';
import { UpdateRecurringComponent } from './../../modals/update-recurring/update-recurring.component';

@Component({
  selector: 'app-recurring',
  standalone: true,
  imports: [NgbCarouselModule, FormsModule, CommonModule, UpdateRecurringComponent],
  templateUrl: './recurring.component.html',
  styleUrl: './recurring.component.scss'
})
export class RecurringComponent implements OnInit {

  pending_rec_trans: any[] = [];
  @Output() refreshParent: EventEmitter<any> = new EventEmitter();
  updateTrans: any;

  constructor(private apiService: ApiService, public utilService: UtilService, private modalService: NgbModal) { }

  async ngOnInit() {
    setTimeout(() => {
      const carouselArrows = document.querySelectorAll('.carousel-control-next,.carousel-control-prev');
      carouselArrows.forEach((element) => {
        let carouselArrow = element as HTMLElement;
        carouselArrow.style.width = 'auto';
      });
      const carouselIndicators = document.querySelectorAll('.carousel-indicators [data-bs-target]');
      carouselIndicators.forEach((element) => {
        let carouselIndicator = element as HTMLElement;
        carouselIndicator.style.backgroundColor = 'black';
      });
    }, 1000);
    this.fetchRecurringTransToday();
  }

  async fetchRecurringTransToday() {
    const getTodayRecTrsResp = await firstValueFrom(this.apiService.getRecurringTransToday({ user_id: this.utilService.appUserId }));
    if (getTodayRecTrsResp.success === true) {
      if (getTodayRecTrsResp.response === '200') {
        this.pending_rec_trans = getTodayRecTrsResp.dataArray;
      } else {
        this.pending_rec_trans = [];
      }
    }
  }

  paused = false;
  unpauseOnArrow = false;
  pauseOnIndicator = false;
  pauseOnHover = true;
  pauseOnFocus = true;
  slideInterval = 7000;

  @ViewChild('carousel', { static: true }) carousel!: NgbCarousel;

  togglePaused() {
    if (this.paused) {
      this.carousel.cycle();
    } else {
      this.carousel.pause();
    }
    this.paused = !this.paused;
  }

  onSlide(slideEvent: NgbSlideEvent) {
    if (
      this.unpauseOnArrow &&
      slideEvent.paused &&
      (slideEvent.source === NgbSlideEventSource.ARROW_LEFT || slideEvent.source === NgbSlideEventSource.ARROW_RIGHT)
    ) {
      this.togglePaused();
    }
    if (this.pauseOnIndicator && !slideEvent.paused && slideEvent.source === NgbSlideEventSource.INDICATOR) {
      this.togglePaused();
    }
  }

  getMoneyVal(value: any, existingClass: string, negativeClass: string, positiveClass: string) {
    let _type = value.rec_trans_type;
    let classListValue = existingClass;
    classListValue += _type.toUpperCase().indexOf("DEBIT") != -1 ? negativeClass : positiveClass;
    return classListValue;
  }

  async process(item: any, edit?: number) {
    let _inpObj = {
      desc: item.rec_trans_desc,
      date: this.utilService.convertDate(new Date()),
      amount: item.rec_trans_amount,
      rec_trans_id: item.rec_trans_id
    };
    if (edit !== undefined) {
      _inpObj.desc = item.newRecDesc;
      _inpObj.date = this.utilService.convertDate(item.newRecTransExecDate);
      _inpObj.amount = this.utilService.roundUpAmount(item.newRecAmt);
    }
    const completeRecTransResp: any = await firstValueFrom(this.apiService.completeRecurTrans(_inpObj));
    if (completeRecTransResp.success === true) {
      this.fetchRecurringTransToday();
      this.refreshParent.emit();
      this.utilService.showAlert("Recurring Transaction completed successfully.", 'success');
    } else {
      this.utilService.showAlert(completeRecTransResp);
    }
  }

  skip(data: any) {
    let _updTrans = {
      rec_trans_desc: data.rec_trans_desc,
      rec_trans_id: data.rec_trans_id,
      rec_trans_last_executed: this.utilService.convertDate(new Date()),
      rec_trans_amount: data.rec_trans_amount,
      rec_account_id: data.rec_account_id,
      user_id: this.utilService.appUserId,
      rec_trans_date: data.rec_trans_date,
      rec_mf_scheme_name: "0",
      rec_trans_executed: "true"
    };
    if (data.is_mf === '1') {
      _updTrans.rec_mf_scheme_name = data.rec_mf_scheme_name;
    }
    this.apiService.updateRecTrans([_updTrans]).subscribe({
      next: (updRecTransResp: any) => {
        if (updRecTransResp[0].success === true) {
          this.fetchRecurringTransToday();
          this.refreshParent.emit();
          this.utilService.showAlert("Recurring Transaction skipped for current occurrence successfully.", 'success');
        } else {
          this.utilService.showAlert(updRecTransResp[0]);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  pause(data: any) {
    let _updTrans = {
      rec_trans_id: data.rec_trans_id,
      is_paused: "true"
    };
    this.apiService.updateRecTrans([_updTrans]).subscribe({
      next: (updRecTransResp: any) => {
        if (updRecTransResp[0].success === true) {
          this.fetchRecurringTransToday();
          this.refreshParent.emit();
          this.utilService.showAlert("Recurring Transaction Paused.", 'success');
        } else {
          this.utilService.showAlert(updRecTransResp[0]);
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  modalRef: any;

  update(content: TemplateRef<any>, data: any) {
    this.updateTrans = data;
    this.modalRef = this.modalService.open(content,
      {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        fullscreen: 'md',
        scrollable: true,
        size: 'lg'
      });
    this.modalRef.result.then(
      (result: any) => {
        console.log("Update - " + result);
      },
      (_reason: any) => { },
    );
  }

  saveOrUpdate(item: any) {
    if (item.is_valid == true) {
      item.newRecDesc = item.rec_trans_desc;
      item.newRecTransExecDate = item.rec_trans_last_executed;
      item.newRecAmt = item.rec_trans_amount;
      if (item.newRecDesc == undefined || item.newRecDesc?.length! < 3) {
        this.utilService.showAlert("Description must be atleast 3 characters");
        return;
      }
      if (item.newRecTransExecDate == undefined || item.newRecTransExecDate == null) {
        this.utilService.showAlert("Date is invalid or blank");
        return;
      }
      if (item.newRecAmt == undefined || item.newRecAmt == 0) {
        this.utilService.showAlert("Amount is invalid or blank");
        return;
      }
      this.process(item, 1);
      this.modalRef.close('Save clicked');
    } else {
      this.utilService.showAlert('One or more form fields are invalid');
    }
  }

  modifiedRecord: any = {};

  updatedRecord(event: any) {
    this.modifiedRecord.rec_trans_id = event.id;
    this.modifiedRecord.rec_trans_amount = this.utilService.roundUpAmount(event.amount);
    this.modifiedRecord.rec_trans_desc = event.description;
    this.modifiedRecord.rec_trans_last_executed = event.transDate;
    this.modifiedRecord.is_valid = event.valid;
  }
}
