import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiDocComponent } from './api-doc.component';
import { Routes, RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [{ path: '', component: ApiDocComponent, data: { tag: 'api-doc' } }];

@NgModule({
    declarations: [ApiDocComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgZorroAntdModule,
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
    ],
})
export class ApiDocModule {}
