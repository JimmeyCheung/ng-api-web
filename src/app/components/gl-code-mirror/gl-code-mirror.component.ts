import {
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    ElementRef,
    forwardRef,
    Input,
    ChangeDetectorRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import * as CodeMirror from 'codemirror';
import 'codemirror/mode/sql/sql.js';
import 'codemirror/mode/javascript/javascript.js';
// import 'codemirror/mode/json/json.js';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'gl-code-mirror',
    templateUrl: './gl-code-mirror.component.html',
    styleUrls: ['./gl-code-mirror.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => GlCodeMirrorComponent),
            multi: true,
        },
    ],
})
export class GlCodeMirrorComponent implements ControlValueAccessor, OnInit, AfterViewInit {
    @Input() mode: string; // 代码类型
    @Input() lineNumbers = true; // 是否在编辑器左侧显示行号
    @Input() matchBrackets = true; // 括号匹配
    @Input() styleActiveLine = true; // 当前行背景高亮
    // @Input() theme = 'midnight'; // 编辑器主题

    @Input() width = 'auto';
    @Input() height = '200px';

    @ViewChild('codeMirrorEl', { static: false }) codeMirrorEl: ElementRef;
    editor: any;
    disabled: boolean; // 是否只读

    // 定义ControlValueAccessor提供的事件回调
    value: any;
    onChange: (value: string | string[]) => void = () => null;
    onTouched: () => void = () => null;

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit() {
        // console.dir(this.codeMirrorEl.nativeElement);
    }
    ngAfterViewInit() {
        this.editor = CodeMirror(this.codeMirrorEl.nativeElement, {
            lineNumbers: this.lineNumbers,
            matchBrackets: this.matchBrackets,
            styleActiveLine: this.styleActiveLine,
            // theme: this.theme,
            value: this.value || '',
            mode: this.mode,
            json: true,
        });

        this.editor.on('change', () => {
            this.onChange(this.editor.getValue());
        });

        this.editor.setSize(this.width, this.height);
    }

    writeValue(obj: any): void {
        this.value = obj;
        if (this.editor) {
            this.editor.setValue(this.value || '');
            this.cdr.markForCheck();
        }
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
