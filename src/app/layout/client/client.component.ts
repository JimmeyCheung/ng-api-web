import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { Observable, Subscription } from 'rxjs';
import { ClientService, BreadcrumbItem } from './client.service';
import { Location } from '@angular/common';
import * as _ from 'lodash';

@Component({
    selector: 'app-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.scss'],
})
export class ClientComponent implements OnInit, OnDestroy {
    projectName = '';
    menus = [];

    breadcrumbList: BreadcrumbItem[] = [];

    private subscription: Subscription;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private title: Title,
        private service: ClientService,

        private cdRef: ChangeDetectorRef,
        private location: Location
    ) {}

    ngOnInit() {
        this.projectName = environment.config.PROJECT_NAME;
        this.title.setTitle(environment.config.PROJECT_NAME);
        this.loadSuBreadcrumb();
        this.loadMenus();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    loadSuBreadcrumb() {
        this.subscription = this.service.getBreadCrumb().subscribe(data => {
            this.breadcrumbList = data || [];
            this.cdRef.detectChanges();
        });
    }

    loadMenus() {
        this.service.getResourceTreeListAll().subscribe(result => {
            this.menus = result;
            this.loadFirstRouter();
        });
    }

    /**
     * 加载第一个路由地址
     */
    private loadFirstRouter() {
        if (this.menus.findIndex(v => v.link.indexOf(this.router.url) > -1) > -1) {
            return;
        }
        const url = this.getNavigateFirst(_.cloneDeep(this.menus));
        this.router.navigate([url]);
    }

    /**
     * 获得第一个路由地址
     * @param menus 导航
     */
    private getNavigateFirst(menus) {
        const [first] = menus;
        if (first && first.link) {
            return first.link;
        } else {
            if (first.children && first.children.length > 0) {
                return this.getNavigateFirst(first.children);
            } else {
                menus.shift();
                return this.getNavigateFirst(menus);
            }
        }
    }

    evtBreadcrumbItem(item: BreadcrumbItem) {
        switch (item.type) {
            case 'back':
                this.location.back();
                break;
            case 'user-defined':
                item.event();
                break;
        }
    }

    evtLogout() {
        this.service.userLogout().subscribe(result => {
            this.router.navigate(['login']);
        });
    }
}
