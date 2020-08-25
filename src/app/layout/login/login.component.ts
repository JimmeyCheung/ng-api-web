import { LoginService } from './login.service';
import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewInit,
    HostListener,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { environment } from 'environments/environment';
import { Title } from '@angular/platform-browser';
import { fromEvent } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit {
    projectName = '';
    @ViewChild('loginBtn', { static: false }) loginBtn: ElementRef;
    username = `${environment.config.PROJECT_NAME_SIGN}_username`;
    password = `${environment.config.PROJECT_NAME_SIGN}_password`;
    /**
     * 登录属性对象
     */
    userData = {
        userAccount: null,
        password: null,
    };

    // 监听事件 浏览器关闭
    @HostListener('window:keydown', ['$event']) onKeyDown(e) {
        if (e.keyCode === 13) {
            this.login();
        }
    }
    constructor(
        private http: HttpClient,
        private router: Router,
        private ativatedRoute: ActivatedRoute,
        private title: Title,
        private service: LoginService
    ) {}

    ngOnInit() {
        this.projectName = environment.config.PROJECT_NAME;
        this.title.setTitle(environment.config.PROJECT_NAME);
    }

    ngAfterViewInit() {
        const source = fromEvent(this.loginBtn.nativeElement, 'click');
        source
            .pipe(
                debounceTime(300),
                tap(_ => this.login())
            )
            .subscribe();
    }

    private login() {
        this.service.attemptAuth(this.userData).subscribe(_ => {
            this.router.navigate(['/client']);
        });
    }
}
