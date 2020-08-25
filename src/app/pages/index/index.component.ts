import { ClientService } from './../../layout/client/client.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {

    constructor(
        private clientService: ClientService
    ) { }

    ngOnInit() {
        this.clientService.buildBreadCrumb([{
            icon: 'home',
            link: '/client/index'
        }, {
            text: '首页'
        }]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

}
