import { NgModule } from '@angular/core';
import { ClientComponent } from './client.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from 'app/pages/pages-routing.module';

@NgModule({
    declarations: [ClientComponent],
    imports: [
        CommonModule,
        PagesRoutingModule,
        NgZorroAntdModule,
    ],
    exports: [ClientComponent],
    providers: [
    ]
})
export class ClientModule { }
