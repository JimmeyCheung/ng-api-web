import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';
import { R } from 'app/entity/vo/R';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ApiDocService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    //#region api分组

    /**
     * 获得API分组
     * @param parent 参数
     */
    getApiGroupList(parent = '-1') {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/group/selectListByParent';
        return this.http
            .post<R>(url, { SYS_PARENT: parent })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg);
                    }
                }),
                filter(json => json.code === 0),
                map(json =>
                    json.data.map(item => {
                        return {
                            ...item,
                            title: item.GROUP_NAME,
                            key: item.SYS_API_GROUP_ID,
                            isLeaf: !Boolean(item.SYS_HAVE_CHILD),
                            nodeType: item.SYS_NODE_TYPE,
                        };
                    })
                )
            );
    }

    /**
     * 添加系统附件
     * @param data 参数
     */
    addApiGroupData(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/group/insert';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('API（节点）添加成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                const item = json.data;
                return {
                    ...item,
                    title: item.GROUP_NAME,
                    key: item.SYS_API_GROUP_ID,
                    isLeaf: true,
                    nodeType: item.SYS_NODE_TYPE,
                };
            })
        );
    }

    /**
     * 更新内容
     * @param data 参数
     */
    updateApiGroupData(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/group/update';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('更新成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                const item = json.data;
                return {
                    ...item,
                    title: item.GROUP_NAME,
                    key: item.SYS_API_GROUP_ID,
                    isLeaf: true,
                    nodeType: item.SYS_NODE_TYPE,
                };
            })
        );
    }

    /**
     * 删除系统附件
     * @param id 编码
     */
    deleteApiGroupData(id) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/group/delete';
        return this.http
            .post<R>(url, { SYS_API_GROUP_ID: id })
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('删除成功。');
                    } else {
                        this.message.error(json.msg);
                    }
                }),
                filter(json => json.code === 0)
            );
    }

    /**
     * 查询api
     */
    selectListByQuery(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/group/selectListByQuery';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                return json.data.map(item => {
                    return {
                        text: item.GROUP_NAME,
                        value: item.SYS_API_GROUP_ID,
                    };
                });
            })
        );
    }

    /**
     * 获得api所有父节点
     * @param id 编码
     */
    getApiParentAllList(id) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/group/selectListAllParentById';
        return this.http
            .post<R>(url, { SYS_API_GROUP_ID: id })
            .pipe(
                filter(json => json.code === 0),
                map(json => {
                    return json.data.map(item => {
                        return {
                            text: item.GROUP_NAME,
                            value: item.SYS_API_GROUP_ID,
                        };
                    });
                })
            );
    }

    //#endregion

    //#region api导入文档

    /**
     * 导入api到文档
     * @param data 参数
     */
    saveApiInsertList(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/group/insertList';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('添加成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                return json.data.map(item => {
                    return {
                        ...item,
                        title: item.GROUP_NAME,
                        key: item.SYS_API_GROUP_ID,
                        isLeaf: !Boolean(item.SYS_HAVE_CHILD),
                        nodeType: item.SYS_NODE_TYPE,
                    };
                });
            })
        );
    }

    /**
     * 获得分组api列表
     * @param id 参数
     */
    getGroupAPIList(id) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/group/selectListByParentForApi';
        return this.http
            .post<R>(url, { SYS_API_GROUP_ID: id })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.warning(json.msg);
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }
    //#endregion
}
