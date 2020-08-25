import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommonService {
    constructor() {}

    //#region 表单相关
    /**
     * 表单验证
     *
     * @memberof CommonService
     */
    formVerify = (form: FormGroup): boolean => {
        // tslint:disable-next-line:forin
        for (const i in form.controls) {
            form.controls[i].markAsDirty();
            form.controls[i].updateValueAndValidity();
        }
        // 表单验证状态
        if (form.status !== 'VALID') {
            return false;
        }
        return true;
    };

    //#endregion

    //#region 导航相关

    /**
     * 缓存有权限菜单
     * @param list 菜单列表
     */
    setNavigeList(list) {
        sessionStorage.setItem(
            environment.config.PROJECT_NAME_SIGN + '_navige',
            JSON.stringify(list)
        );
    }

    /**
     * 获得权限菜单
     */
    getNavigeList(): any[] {
        const listStr = sessionStorage.getItem(environment.config.PROJECT_NAME_SIGN + '_navige');
        return JSON.parse(listStr);
    }
    //#endregion

    //#region 登录账号相关

    /**
     * 本地缓存保存用户登录信息
     * @param data 用户登录信息
     */
    setUserLoginInfo(data): void {
        const { token, id, sessionUser } = data;
        localStorage.setItem(environment.config.PROJECT_NAME_SIGN + '_token', token);
        localStorage.setItem(environment.config.PROJECT_NAME_SIGN + '_id', id);
        sessionStorage.setItem(
            environment.config.PROJECT_NAME_SIGN + '_sessionUser',
            JSON.stringify(sessionUser)
        );
    }

    /**
     * 获得用户登录信息
     */
    getUserLoginInfo() {
        const token = localStorage.getItem(environment.config.PROJECT_NAME_SIGN + '_token');
        const id = localStorage.getItem(environment.config.PROJECT_NAME_SIGN + '_id');
        const sessionUser = JSON.parse(
            sessionStorage.getItem(environment.config.PROJECT_NAME_SIGN + '_sessionUser')
        );
        return { token, id, sessionUser };
    }
    //#endregion
}
