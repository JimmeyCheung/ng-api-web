import { environment } from 'environments/environment';
import { CommonService } from 'app/util/common.service';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpResponse,
    HttpErrorResponse,
    HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Router } from '@angular/router';
import { tap, finalize } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const userInfo = this.commonService.getUserLoginInfo();
        // let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const setHeaders = {};
        if (userInfo.token && userInfo.id) {
            setHeaders['Authorization'] = userInfo.token;
            setHeaders['X-Auth-Id'] = userInfo.id;
        }
        const clonedRequest = req.clone({ setHeaders });
        return next.handle(clonedRequest).pipe(
            tap(
                event => {
                    if (event instanceof HttpResponse) {
                        // console.log(event);
                    }
                },
                (event: HttpErrorResponse) => {
                    if (event.status === 401) {
                        this.message.error('您已经掉线，请重新登录');
                        this.router.navigate(['login']);
                    }
                }
            ),
            finalize(
                () => {}
                // // console.log('请求完成时间' + (+ new Date()))
            )
        );
    }
}
