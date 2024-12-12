import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpRequest, HttpHandler } from '@angular/common/http';
import { EMPTY, Observable, catchError, finalize } from 'rxjs';
import { UtilService } from './services/util.service';

@Injectable()
export class AppInterceptor implements HttpInterceptor {

    constructor(private utilService: UtilService) { }

    intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.utilService.showLoadSpinner();
        return next.handle(httpRequest).pipe(
            finalize(() => {
                this.utilService.hideLoadSpinner();
            }),
            catchError(err => {
                if (err.status == 0) {
                    this.utilService.showAlert('Request Timed Out');
                }
                console.log(err);
                return EMPTY;
            })
        );
    }
}