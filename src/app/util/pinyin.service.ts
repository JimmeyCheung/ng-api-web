/*
 * @Author: mikey.Huwenhong
 * @Date: 2020-03-17 15:23:37
 * @Last Modified by: mikey.Huwenhong
 * @Last Modified time: 2020-03-17 15:25:11
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
/**
 * 拼音类
 *
 * @export
 * @interface PinYin
 */
export interface PinYin {
    /**
     * 汉字
     */
    HZ: string;
    /**
     * 简拼
     */
    JP: string;
    /**
     * 全拼
     */
    QUANPIN: string;
    /**
     * 五笔
     */
    WB: string;
    /**
     * 简拼2
     */
    JP2: string;
    /**
     * 全拼2
     */
    QuanPin2: string;
}

@Injectable({
    providedIn: 'root'
})
export class PinyinService {

    private _libPinYinList: PinYin[] = [];
    private _linJPList = {};

    constructor(
        private http: HttpClient
    ) {
        // this.hanziToJP('胡文鸿').then(data => console.dir(data));
    }

    /**
     * 获得拼音库
     *
     * @readonly
     * @private
     * @type {Promise<PinYin[]>}
     * @memberof PinyinService
     */
    private get libPinYinList(): Promise<PinYin[]> {
        if (this._libPinYinList.length > 0) {
            return Promise.resolve(this._libPinYinList);
        } else {
            const pinyinURL = 'assets/lib/py.json';
            return this.http.get<PinYin[]>(pinyinURL)
                .pipe(
                    tap(data => this._libPinYinList = data)
                ).toPromise();
        }
    }

    /**
     * 获得简拼对象
     *
     * @returns {Promise<any>} 简拼对象
     * @memberof PinyinService
     */
    private get linJPList(): Promise<any> {
        if (Object.keys(this._linJPList).length > 0) {
            return Promise.resolve(this._linJPList);
        } else {
            return this.libPinYinList.then(pinyin => {
                const jp = {};
                pinyin.forEach(item => jp[item.HZ] = item.JP);
                this._linJPList = jp;
                return jp;
            });
        }
    }

    /**
     * 汉字转拼音
     *
     * @param {string} hanzi 汉字
     * @returns {Promise<string>} 拼音
     * @memberof PinyinService
     */
    hanziToJP(hanzi: string): Promise<string> {
        return this.linJPList.then(jpList => {
            const jp = [];
            for (const char of hanzi) {
                jp.push(jpList[char]);
            }
            return jp.join('');
        });
    }
}
