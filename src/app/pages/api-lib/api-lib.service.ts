import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';
import { R } from 'app/entity/vo/R';
import { filter, map, tap } from 'rxjs/operators';
import { NodeTypeEnum } from 'app/entity/enums/NodeTypeEnum';

@Injectable({
    providedIn: 'root',
})
export class ApiLibService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    //#region api库操作

    /**
     * 获得 系统API库 分组
     * @param parent 父节点
     */
    getSysApiList(parent = '-1') {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/selectListByParent';
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
                        item.URL = `${item.API_BASE_URL}:${item.API_PORT}${item.API_URL}`;
                        return {
                            ...item,
                            title: item.API_NAME,
                            key: item.SYS_API_ID,
                            isLeaf: !Boolean(item.SYS_HAVE_CHILD),
                            nodeType: item.SYS_NODE_TYPE,
                            // disabled: item.SYS_NODE_TYPE === NodeTypeEnum.TREE,
                        };
                    })
                )
            );
    }

    /**
     * 添加系统api
     * @param data 参数
     */
    addSysApiData(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/insert';
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
                item.URL = `${item.API_BASE_URL}:${item.API_PORT}${item.API_URL}`;
                return {
                    ...item,
                    title: item.API_NAME,
                    key: item.SYS_API_ID,
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
    updateSysApiData(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/update';
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
                    title: item.API_NAME,
                    key: item.SYS_API_ID,
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
    deleteSysApiData(id) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/delete';
        return this.http
            .post<R>(url, { SYS_API_ID: id })
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
     * 获得api详细信息
     */
    getApiData(id) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/selectOne';
        return this.http
            .post<R>(url, { SYS_API_ID: id })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg);
                    }
                }),
                filter(json => json.code === 0),
                map(json => {
                    const item = json.data;
                    item.URL = `${item.API_BASE_URL}:${item.API_PORT}${item.API_URL}`;
                    return item;
                })
            );
    }

    /**
     * 查询api
     */
    selectListByQuery(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/selectListByQuery';
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
                        text: item.API_NAME,
                        value: item.SYS_API_ID,
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
        const url = 'api/gl-service-sys-api/v1/api/sys/api/selectListAllParentById';
        return this.http
            .post<R>(url, { SYS_API_ID: id })
            .pipe(
                filter(json => json.code === 0),
                map(json => {
                    return json.data.map(item => {
                        return {
                            text: item.API_NAME,
                            value: item.SYS_API_ID,
                        };
                    });
                })
            );
    }

    //#endregion

    //#region api输入参数操作

    /**
     * 增加api 输入参数
     * @param data 参数
     */
    addParamsData(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/param/insert';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('参数添加成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                const item = json.data;
                item.PARAM_IS_NOT_NULL = Boolean(item.PARAM_IS_NOT_NULL);
                return item;
            })
        );
    }

    /**
     * 更新api参数信息
     * @param data 参数
     */
    updateParamsData(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/param/update';
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
                item.PARAM_IS_NOT_NULL = Boolean(item.PARAM_IS_NOT_NULL);
                return item;
            })
        );
    }

    /**
     * 获得api输入参数
     * @param id 参数
     */
    getParamsList(id) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/param/selectListByApiId';
        return this.http
            .post<R>(url, { PARAM_API_ID: id })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg);
                    }
                }),
                filter(json => json.code === 0),
                map(json =>
                    json.data.map(item => {
                        item.PARAM_IS_NOT_NULL = Boolean(item.PARAM_IS_NOT_NULL);
                        return item;
                    })
                )
            );
    }

    /**
     * 删除api参数
     * @param id 参数
     */
    deleteParamsData(id) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/param/delete';
        return this.http
            .post<R>(url, { SYS_API_PARAM_ID: id })
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
    //#endregion

    //#region api输出参数操作

    /**
     * 增加api 输出参数
     * @param data 参数
     */
    addOutParamsData(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/out/insert';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('参数添加成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                const item = json.data;
                item.PARAM_IS_NOT_NULL = Boolean(item.PARAM_IS_NOT_NULL);
                return item;
            })
        );
    }

    /**
     * 更新api参数信息
     * @param data 参数
     */
    updateOutParamsData(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/out/update';
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
                item.PARAM_IS_NOT_NULL = Boolean(item.PARAM_IS_NOT_NULL);
                return item;
            })
        );
    }

    /**
     * 获得api输出参数
     * @param id 参数
     */
    getOutParamsList(id) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/out/selectListByApiId';
        return this.http
            .post<R>(url, { OUT_API_ID: id })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg);
                    }
                }),
                filter(json => json.code === 0),
                map(json =>
                    json.data.map(item => {
                        item.PARAM_IS_NOT_NULL = Boolean(item.PARAM_IS_NOT_NULL);
                        return item;
                    })
                )
            );
    }

    /**
     * 删除api参数
     * @param id 参数
     */
    deleteOutParamsData(id) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/out/delete';
        return this.http
            .post<R>(url, { SYS_API_OUT_ID: id })
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
    //#endregion

    //#region 模拟数据
    /**
     * 增加 模拟数据
     * @param data 参数
     */
    addMockData(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/data/insert';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('模拟数据添加成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                const item = json.data;
                item.DATA_IS_ENABLE = Boolean(item.DATA_IS_ENABLE);
                return item;
            })
        );
    }

    /**
     * 更新模拟数据
     * @param data 参数
     */
    updateMockData(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/data/update';
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
                item.DATA_IS_ENABLE = Boolean(item.DATA_IS_ENABLE);
                return item;
            })
        );
    }

    /**
     * 获得模拟数据列表
     * @param id 参数
     */
    getMockDataList(id) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/data/selectListByApiId';
        return this.http
            .post<R>(url, { DATA_API_ID: id })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg);
                    }
                }),
                filter(json => json.code === 0),
                map(json =>
                    json.data.map(item => {
                        item.DATA_IS_ENABLE = Boolean(item.DATA_IS_ENABLE);
                        return item;
                    })
                )
            );
    }

    /**
     * 删除模拟数据
     * @param id 参数
     */
    deleteMockData(id) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/data/delete';
        return this.http
            .post<R>(url, { SYS_API_DATA_ID: id })
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
    //#endregion

    //#region 接口测试

    /**
     * 接口测试
     * @param data 参数
     */
    requestDataByUrl(data) {
        const url = 'api/gl-service-sys-api/v1/api/sys/api/requestDataByUrl';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error('请求出现未知错误。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    //#endregion
}
