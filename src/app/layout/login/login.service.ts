import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import * as CryptoJS from 'crypto-js/crypto-js';
import { environment } from 'environments/environment';
import { R } from 'app/entity/vo/R';
import { Observable } from 'rxjs';
import { tap, filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class LoginService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) { }

    /**
     * 登录验证
     *
     * @param {*} data 验证内容
     * @returns {Observable<boolean>} 是否成功
     */
    attemptAuth(data): Observable<R> {
        const url = 'api/gl-service-sys-user/v1/user/system/auth/login';
        const userInfo = this.commonService.getUserLoginInfo();
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (userInfo.token && userInfo.id) {
            headers = headers.set('Authorization', userInfo.token);
            headers = headers.set('X-Auth-Id', userInfo.id);
        }

        const credentials = this.encryptedDESLogin(data);
        return this.http.post<R>(url, { data: credentials }, { headers }).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.commonService.setUserLoginInfo(json.data);
                    this.message.success('登录成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0)
        );
    }

    /**
     * 加密帐号信息
     *
     * @private
     * @param {*} data 加密内容
     * @returns
     */
    private encryptedDESLogin(data) {
        data = `${data.userAccount}:${data.password}`;
        const keyHex = CryptoJS.enc.Utf8.parse(
            environment.config.AppSettings.NB_NETWORK_CONFIG_DESKey
        );
        // 模式为ECB padding为Pkcs7
        const encrypted = CryptoJS.DES.encrypt(data, keyHex, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        // 加密出来是一个16进制的字符串
        return encrypted.ciphertext.toString();
    }
}
