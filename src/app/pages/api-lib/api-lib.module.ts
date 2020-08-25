import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiLibComponent } from './api-lib.component';
import { Routes, RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GlCodeMirrorModule } from 'app/components/gl-code-mirror/gl-code-mirror.module';

const routes: Routes = [{ path: '', component: ApiLibComponent }];

@NgModule({
    declarations: [ApiLibComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        NgZorroAntdModule,
        ScrollingModule,
        FormsModule,
        ReactiveFormsModule,
        GlCodeMirrorModule,
    ],
})
export class ApiLibModule {}
