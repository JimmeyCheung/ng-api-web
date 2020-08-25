import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, Observable, Subject } from 'rxjs';
import { tap, filter, map } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import { environment } from 'environments/environment';

/**
 * 导航项
 *
 * @export
 */
export interface BreadcrumbItem {
    text?: string;
    link?: string;
    icon?: string;
    treeId?: string;
    // 返回 back
    type?: string;
    // 自定义
    // tslint:disable-next-line:ban-types
    event?: Function;
}

@Injectable({
    providedIn: 'root',
})
export class ClientService {
    private subject = new Subject<Array<BreadcrumbItem>>();

    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    /**
     * 构建面包屑
     *
     * @param {Array<BreadcrumbItem>} breadcrumbList 面包屑配置
     * @memberof ClientService
     */
    buildBreadCrumb(breadcrumbList: Array<BreadcrumbItem>) {
        this.subject.next(breadcrumbList);
    }

    clearBreadCrumb() {
        this.subject.next();
    }

    getBreadCrumb(): Observable<Array<BreadcrumbItem>> {
        return this.subject.asObservable();
    }

    /**
     * 获得系统菜单
     */
    getResourceTreeListAll() {
        const url = 'api/gl-service-sys-core/v1/core/system/resource/tree/selectListNav';
        return this.http
            .post<R>(url, { RESOURCE_GROUP_ID: environment.config.AppSettings.RESOURCE_GROUP_ID })
            .pipe(
                filter(json => json.code === 0),
                map(json => {
                    const { sessionUser } = this.commonService.getUserLoginInfo();
                    if (!sessionUser.authResource || sessionUser.authResource.length === 0) {
                        this.message.warning('当前账号没有权限。');
                    }
                    const tree = [];
                    const list = json.data.filter(
                        v => sessionUser.authResource.indexOf(v.SYSTEM_RESOURCE_TREE_ID) > -1
                    );
                    this.commonService.setNavigeList(list);
                    this.buildResourceTree(list, '-1', tree);
                    return tree;
                })
            );
    }

    /**
     * 构造分组下面的菜单为树型结构
     * @param data 数据源
     * @param parentId 父节点
     * @param tree 树
     */
    private buildResourceTree(data: any[], parent: string, tree: any[]) {
        data.forEach(item => {
            if (item.SYS_PARENT === parent) {
                const newParentNode = {
                    title: item.SYSTEM_RESOURCE_NAME,
                    link: item.SYSTEM_RESOURCE_URL,
                    icon: item.SYSTEM_RESOURCE_ICON,
                    isLeaf: !Boolean(item.SYS_HAVE_CHILD),
                    id: item.SYSTEM_RESOURCE_TREE_ID,
                    children: [],
                };
                if (item.SYSTEM_RESOURCE_TYPE === 1) {
                    tree.push(newParentNode);
                }

                if (item.SYS_HAVE_CHILD) {
                    this.buildResourceTree(
                        data,
                        item.SYSTEM_RESOURCE_TREE_ID,
                        newParentNode.children
                    );
                }
            }
        });
    }

    /**
     * 注销
     */
    userLogout() {
        const url = 'api/gl-service-sys-user/v1/user/system/auth/logout';
        return this.http.post<R>(url, null).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('注销成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0)
        );
    }
}
