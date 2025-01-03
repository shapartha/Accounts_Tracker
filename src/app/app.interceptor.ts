import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpRequest, HttpHandler } from '@angular/common/http';
import { EMPTY, Observable, catchError, finalize } from 'rxjs';
import { UtilService } from './services/util.service';

@Injectable()
export class AppInterceptor implements HttpInterceptor {

    constructor(private utilService: UtilService) { }

    isExecuting: any[] = [];

    intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.utilService.showLoadSpinner();
        this.isExecuting.push(httpRequest.url);
        return next.handle(httpRequest).pipe(
            finalize(() => {
                this.isExecuting.splice(this.isExecuting.findIndex(r => r == httpRequest.url), 1);
                if (this.isExecuting.length == 0) {
                    this.utilService.hideLoadSpinner();
                }
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