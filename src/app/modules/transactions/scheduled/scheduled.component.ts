import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbCarouselModule, NgbCarousel, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'app/services/api.service';
import { UtilService } from 'app/services/util.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-scheduled',
  standalone: true,
  imports: [NgbCarouselModule, FormsModule, CommonModule, MatIconModule],
  templateUrl: './scheduled.component.html',
  styleUrl: './scheduled.component.scss'
})
export class ScheduledComponent implements OnInit, OnChanges {
  pending_scheduled_trans: any[] = [];
  @Input() refreshIt: boolean = false;
  @Output() refreshParent: EventEmitter<any> = new EventEmitter();

  constructor(private apiService: ApiService, public utilService: UtilService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['refreshIt'].isFirstChange() && changes['refreshIt'].currentValue == true) {
      this.fetchScheduledTransToday();
      this.refreshIt = false;
    }
  }

  ngOnInit() {
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
    this.fetchScheduledTransToday();
  }

  async fetchScheduledTransToday() {
    const getTodaySchTrsResp = await firstValueFrom(this.apiService.getScheduledTransToday({ user_id: this.utilService.appUserId }));
    if (getTodaySchTrsResp.success === true) {
      if (getTodaySchTrsResp.response === '200') {
        this.pending_scheduled_trans = getTodaySchTrsResp.dataArray;
      } else {
        this.pending_scheduled_trans = [];
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
    let _type = value.trans_type;
    let classListValue = existingClass;
    classListValue += _type.toUpperCase().indexOf("DEBIT") != -1 ? negativeClass : positiveClass;
    return classListValue;
  }

  process(item: any) {
    let _inpObj_ = {
      trans_id: item.trans_id,
      ops_mode: 1
    };
    this.apiService.processScheduledTrans(_inpObj_).subscribe({
      next: (procResp: any) => {
        if (procResp.success === true) {
          this.fetchScheduledTransToday();
          this.refreshParent.emit();
          this.utilService.showAlert("Scheduled Transaction processed successfully", 'success');
        } else {
          this.utilService.showAlert(procResp);
        }
      },
      error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  remove(item: any) {
    let _inpObj_ = {
      trans_id: item.trans_id,
      ops_mode: 2
    };
    this.apiService.processScheduledTrans(_inpObj_).subscribe({
      next: (procResp: any) => {
        if (procResp.success === true) {
          this.fetchScheduledTransToday();
          this.refreshParent.emit();
          this.utilService.showAlert("Scheduled Transaction removed successfully", 'success');
        } else {
          this.utilService.showAlert(procResp);
        }
      },
      error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }

  postpone(item: any) {
    let _inpObj_ = {
      trans_id: item.trans_id,
      ops_mode: 3
    };
    this.apiService.processScheduledTrans(_inpObj_).subscribe({
      next: (procResp: any) => {
        if (procResp.success === true) {
          this.fetchScheduledTransToday();
          this.refreshParent.emit();
          this.utilService.showAlert("Scheduled Transaction postponed successfully", 'success');
        } else {
          this.utilService.showAlert(procResp);
        }
      },
      error: (err) => {
        console.error(err);
        this.utilService.showAlert(err);
      }
    });
  }
}
