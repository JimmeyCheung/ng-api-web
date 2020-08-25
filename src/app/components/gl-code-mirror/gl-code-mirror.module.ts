import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlCodeMirrorComponent } from './gl-code-mirror.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [GlCodeMirrorComponent],
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [GlCodeMirrorComponent]
})
export class GlCodeMirrorModule { }
