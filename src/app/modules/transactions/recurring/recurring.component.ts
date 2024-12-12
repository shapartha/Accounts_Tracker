import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbCarousel, NgbCarouselModule, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-recurring',
  standalone: true,
  imports: [NgbCarouselModule, FormsModule, CommonModule],
  templateUrl: './recurring.component.html',
  styleUrl: './recurring.component.scss'
})
export class RecurringComponent implements OnInit {

  pending_rec_trans: any[] = [];
  @Output() refreshParent: EventEmitter<any> = new EventEmitter();


  constructor(private apiService: ApiService, public utilService: UtilService) { }

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

  // async processRecTransNow(item: any, edit?: number) {
  //   this.appService.showLoader();
  //   let _inpObj = {
  //     desc: item.rec_trans_desc,
  //     date: this.appService.convertDate(new Date()),
  //     amount: item.rec_trans_amount,
  //     rec_trans_id: item.rec_trans_id
  //   };
  //   if (edit !== undefined) {
  //     _inpObj.desc = item.newRecDesc;
  //     _inpObj.date = this.appService.convertDate(item.newRecTransExecDate);
  //     _inpObj.amount = this.appService.roundUpAmount(item.newRecAmt);
  //   }
  //   const completeRecTransResp = await this.appService.completeRecurTrans(_inpObj);
  //   if (completeRecTransResp.success === true) {
  //     this.refreshPendRecTrans = true;
  //     this.refreshTransactions = true;

  //     let _updCat = this.categories.filter(_cat => _cat.id === item.category_id)[0];
  //     let _updAct = _updCat.accounts!.filter(_acc => _acc.id === item.account_id)[0];
  //     let _trnAmt = Number(item.rec_trans_amount);
  //     if (item.rec_trans_type.toUpperCase() === 'CREDIT') {
  //       _updAct.balance = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updAct.balance) + _trnAmt);
  //       _updCat.amount = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updCat.amount) + _trnAmt);
  //     } else {
  //       _updAct.balance = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updAct.balance) - _trnAmt);
  //       _updCat.amount = this.appService.formatAmountWithComma(this.appService.formatStringValueToAmount(_updCat.amount) - _trnAmt);
  //     }

  //     this.appService.showAlert("Recurring Transaction completed successfully.")
  //   } else {
  //     this.appService.showAlert(completeRecTransResp);
  //   }
  //   this.appService.hideLoader();
  // }

  // async skipRecTrans(data: any) {
  //   let _updTrans = {
  //     rec_trans_desc: data.rec_trans_desc,
  //     rec_trans_id: data.rec_trans_id,
  //     rec_trans_last_executed: this.appService.convertDate(new Date()),
  //     rec_trans_amount: data.rec_trans_amount,
  //     rec_account_id: data.rec_account_id,
  //     user_id: this.appService.getAppUserId,
  //     rec_trans_date: data.rec_trans_date,
  //     rec_mf_scheme_name: "0",
  //     rec_trans_executed: "true"
  //   };
  //   if (data.is_mf === '1') {
  //     _updTrans.rec_mf_scheme_name = data.rec_mf_scheme_name;
  //   }
  //   this.appService.showLoader();
  //   const updRecTransResp = await this.appService.updateRecTrans([_updTrans]);
  //   if (updRecTransResp[0].success === true) {
  //     this.refreshPendRecTrans = true;
  //     this.appService.showAlert("Recurring Transaction skipped for current occurrence successfully.");
  //   } else {
  //     this.appService.showAlert(updRecTransResp[0]);
  //   }
  //   this.appService.hideLoader();
  // }

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
        }
      }, error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }
}
