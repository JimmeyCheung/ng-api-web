import { ApiLibService } from './api-lib.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NzTreeNode, NzFormatEmitEvent, NzModalService, NzTreeComponent } from 'ng-zorro-antd';
import { NodeTypeEnum, NodeTypeEnum_CN } from 'app/entity/enums/NodeTypeEnum';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { CommonService } from 'app/util/common.service';
import { ApiRequestTypeEnum, ApiRequestTypeEnum_CN } from 'app/entity/enums/ApiRequestTypeEnum';
import { filter, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import * as Mock from 'mockjs';
import { ApiStatusEnum, ApiStatusEnum_CN } from 'app/entity/enums/ApiStatusEnum';
import { environment } from 'environments/environment';

import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import { ApiParamTypeEnum, ApiParamTypeEnum_CN } from 'app/entity/enums/ApiParamTypeEnum';
hljs.registerLanguage('json', json);

@Component({
    selector: 'app-api-lib',
    templateUrl: './api-lib.component.html',
    styleUrls: ['./api-lib.component.scss'],
})
export class ApiLibComponent implements OnInit {
    nodeTypeEnum = NodeTypeEnum;
    nodeTypeList = NodeTypeEnum_CN;

    apiRequestTypeEnum = ApiRequestTypeEnum;
    apiRequestTypeList = ApiRequestTypeEnum_CN;

    apiParamTypeEnum = ApiParamTypeEnum;
    apiParamTypeList = ApiParamTypeEnum_CN;

    apiStatusEnum = ApiStatusEnum;
    apiStatusList = ApiStatusEnum_CN;

    /**
     * 头部操作
     */
    headHandleIfy = {
        evtAdd: () => {
            this.sysApiDrawerIfy.form.get('SYS_NODE_TYPE').enable();
            this.sysApiDrawerIfy.form.reset({
                SYS_NODE_TYPE: NodeTypeEnum.GENERAL,
                API_STATUS: ApiStatusEnum.DESIGN,
                API_REQUEST_MODE: ApiRequestTypeEnum.POST,
            });
            this.sysApiDrawerIfy.open();
        },
        evtEdit: () => {
            this.sysApiDrawerIfy.isEdit = true;
            const { origin } = this.apiLibraryIfy.tree.activedNode;
            this.sysApiDrawerIfy.form.get('SYS_NODE_TYPE').disable();
            this.sysApiDrawerIfy.form.reset(origin);
            this.sysApiDrawerIfy.open();
        },
        evtDel: () => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除：${this.apiLibraryIfy.tree.activedNode.title} 吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    this.service
                        .deleteSysApiData(this.apiLibraryIfy.tree.activedNode.key)
                        .subscribe(result => {
                            this.apiLibraryIfy.tree.activedNode.remove();
                            const parentNode = this.apiLibraryIfy.tree.activedNode.parentNode;
                            if (parentNode && parentNode.getChildren().length === 0) {
                                parentNode.isLeaf = true;
                            } else {
                                if (!parentNode) {
                                    this.apiLibraryIfy.tree.nodes.splice(
                                        this.apiLibraryIfy.tree.nodes.findIndex(
                                            item =>
                                                item.key === this.apiLibraryIfy.tree.activedNode.key
                                        ),
                                        1
                                    );
                                    this.apiLibraryIfy.tree.nodes = [
                                        ...this.apiLibraryIfy.tree.nodes,
                                    ];
                                }
                            }
                            this.apiLibraryIfy.tree.activedNode = null;
                        });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
    };

    @ViewChild('apiGroupTreeElement', { static: false }) apiGroupTreeElement: NzTreeComponent;
    /**
     * api库分组
     */
    apiLibraryIfy = {
        find: {
            // 搜索框
            searchWidth: 280,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: <any>[],
            parentList: <any>[],
            selectedIndex: -1,
            change: (value: string) => {
                if (value) {
                    this.service.getApiParentAllList(value).subscribe(result => {
                        this.apiLibraryIfy.find.parentList = result;

                        const nodes = this.apiGroupTreeElement.getTreeNodes();
                        this.apiLibraryIfy.tree._selectedLocationTree(nodes, value);
                    });
                }
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.service
                        .selectListByQuery({
                            API_NAME: searchKey,
                            API_URL: searchKey,
                        })
                        .subscribe(result => {
                            this.apiLibraryIfy.find.list = result;
                        });
                }
            },
        },

        tree: {
            nodes: [],
            icons: ['sitemap', 'file-o'],
            activedNode: <NzTreeNode>null,
            evtActiveNode: (data: NzFormatEmitEvent) => {
                this.apiLibraryIfy.tree.activedNode = data.node;
                if (
                    this.apiLibraryIfy.tree.activedNode.origin.SYS_NODE_TYPE ===
                    NodeTypeEnum.GENERAL
                ) {
                    this.apiTabIfy.evtChange({ index: this.apiTabIfy.selectedIndex });
                }
            },
            evtExpandChange: (event: Required<NzFormatEmitEvent>) => {
                if (event.eventName === 'expand') {
                    const node = event.node;

                    if (node && node.getChildren().length === 0 && node.isExpanded) {
                        this.service
                            .getSysApiList(node.key)
                            .subscribe(nodes => node.addChildren(nodes));
                    }
                }
            },
            /**
             * 定位机构树节点
             */
            _selectedLocationTree: (nodes: NzTreeNode[], loctionOrg: string) => {
                nodes.forEach(async node => {
                    if (loctionOrg === node.key) {
                        this.apiLibraryIfy.tree.activedNode = node;
                        this.apiLibraryIfy.tree._locationedContinue();
                        // this.apiLibraryIfy.tree._locationedScroll();
                    } else {
                        const isExist =
                            this.apiLibraryIfy.find.parentList.findIndex(
                                v => v.value === node.key
                            ) > -1;
                        if (isExist) {
                            node.isExpanded = true;
                            // 有子节点并且未取出来
                            if (!node.isLeaf && node.getChildren().length === 0) {
                                const childNodes = await this.apiLibraryIfy.tree._asyncLoadNodeChildNode(
                                    node
                                );
                                node.addChildren(childNodes);
                            }
                            if (node.getChildren().length > 0) {
                                this.apiLibraryIfy.tree._selectedLocationTree(
                                    node.children,
                                    loctionOrg
                                );
                            }
                        }
                    }
                });
            },
            /*
             * 查询子节点
             */
            _asyncLoadNodeChildNode: (node: NzTreeNode): Promise<any> => {
                return this.service.getSysApiList(node.key).toPromise();
            },
            /*
             * 滚动到定位节点位置
             */
            _locationedScroll: () => {
                setTimeout(() => {
                    const node: any = this.apiLibraryIfy.tree.activedNode;
                    const el = <HTMLElement>node.component.dragElement.nativeElement;
                    // this.batchViewPort_left.scrollToOffset(el.offsetTop - 30);
                }, 100);
            },
            _locationedContinue: () => {
                if (
                    this.apiLibraryIfy.tree.activedNode.origin.SYS_NODE_TYPE ===
                    NodeTypeEnum.GENERAL
                ) {
                    this.apiTabIfy.evtChange({ index: this.apiTabIfy.selectedIndex });
                }
            },
        },

        _init: () => {
            this.service
                .getSysApiList()
                .subscribe(nodes => (this.apiLibraryIfy.tree.nodes = nodes));
        },
    };

    /**
     * api 抽屉
     */
    sysApiDrawerIfy = {
        // 抽屉内容
        width: 560,
        visible: false,
        title: '系统函数信息',
        close: () => {
            this.sysApiDrawerIfy.isEdit = false;
            this.sysApiDrawerIfy.visible = false;
        },
        open: () => {
            this.sysApiDrawerIfy.visible = true;
        },
        isEdit: false,
        form: new FormGroup({
            SYS_NODE_TYPE: new FormControl(null, Validators.required),

            API_NAME: new FormControl(null, Validators.required),
            API_STATUS: new FormControl(null),
            API_URL: new FormControl(null),
            API_REQUEST_MODE: new FormControl(null),
            API_PARAM: new FormControl(null),
            API_RETURN: new FormControl(null),
            API_DESC: new FormControl(null),
            API_BASE_URL: new FormControl(null),
            API_PORT: new FormControl(null),

            SYS_API_ID: new FormControl(null),

            isTop: new FormControl(null),
        }),

        save: () => {
            if (this.commonService.formVerify(this.sysApiDrawerIfy.form)) {
                const data = this.sysApiDrawerIfy.form.getRawValue();
                if (this.sysApiDrawerIfy.isEdit) {
                    this.service.updateSysApiData(data).subscribe(node => {
                        this.apiLibraryIfy.tree.activedNode.origin = {
                            ...this.apiLibraryIfy.tree.activedNode.origin,
                            ...node,
                        };
                        this.apiLibraryIfy.tree.activedNode.title = node.title;
                        this.sysApiDrawerIfy.close();
                    });
                    return;
                }
                if (
                    !data.isTop &&
                    this.apiLibraryIfy.tree.activedNode &&
                    this.apiLibraryIfy.tree.activedNode.key
                ) {
                    data.SYS_PARENT = this.apiLibraryIfy.tree.activedNode.key;
                } else {
                    data.SYS_PARENT = '-1';
                }
                this.service.addSysApiData(data).subscribe(node => {
                    if (data.SYS_PARENT === '-1') {
                        this.apiLibraryIfy.tree.nodes.push(node);
                        this.apiLibraryIfy.tree.nodes = [...this.apiLibraryIfy.tree.nodes];
                    } else {
                        this.apiLibraryIfy.tree.activedNode.isLeaf = false;
                        if (this.apiLibraryIfy.tree.activedNode.isExpanded) {
                            this.apiLibraryIfy.tree.activedNode.addChildren([node]);
                        }
                    }
                    this.sysApiDrawerIfy.close();
                });
            }
        },

        evtBeautifyCode: field => {
            this.sysApiDrawerIfy.form
                .get(field)
                .patchValue(
                    JSON.stringify(JSON.parse(this.sysApiDrawerIfy.form.get(field).value), null, 4)
                );
        },
    };

    /**
     * api相关tabset
     */
    apiTabIfy = {
        selectedIndex: 0,
        evtChange: ({ index }) => {
            this.apiTabIfy.selectedIndex = index;

            switch (index) {
                case 0:
                    if (
                        this.apiLibraryIfy.tree.activedNode &&
                        this.apiLibraryIfy.tree.activedNode.origin
                    ) {
                        this.apiLibraryIfy.tree.activedNode.origin.API_PARAM_CODE = hljs.highlight(
                            'json',
                            this.apiLibraryIfy.tree.activedNode.origin.API_PARAM || ''
                        ).value;
                        this.apiLibraryIfy.tree.activedNode.origin.API_RETURN_CODE = hljs.highlight(
                            'json',
                            this.apiLibraryIfy.tree.activedNode.origin.API_RETURN || ''
                        ).value;
                    }
                    this.apiParamsIfy._loadList();
                    this.apiOutParamsIfy._loadList();
                    break;
                case 1:
                    this.mockDataIfy.evtReset();
                    this.mockDataIfy._loadList();
                    break;
                case 2:
                    const { origin } = this.apiLibraryIfy.tree.activedNode;
                    this.apiTestIfy._init(origin);
                    break;
            }
        },
    };

    /**
     * api 输入参数
     */
    apiParamsIfy = {
        selectRow: null,
        selectRowIndex: -1,
        evtSelectRow: (row, index) => {
            this.apiParamsIfy.selectRowIndex = index;
            this.apiParamsIfy.selectRow = row;
        },
        evtReset: () => {
            this.apiParamsIfy.selectRow = null;
            this.apiParamsIfy.selectRowIndex = -1;
        },
        evtAdd: () => {
            this.apiParamsDrawerIfy.form.reset({
                PARAM_IS_NOT_NULL: false,
            });
            this.apiParamsDrawerIfy.open();
        },
        evtEdit: () => {
            this.apiParamsDrawerIfy.isEdit = true;
            this.apiParamsDrawerIfy.form.reset(this.apiParamsIfy.selectRow);
            this.apiParamsDrawerIfy.open();
        },
        evtDel: () => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除：${this.apiParamsIfy.selectRow.PARAM_NAME} 吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    this.service
                        .deleteParamsData(this.apiParamsIfy.selectRow.SYS_API_PARAM_ID)
                        .subscribe(result => {
                            const tblData = this.apiLibraryIfy.tree.activedNode.origin.params;
                            const rowIndex = tblData.findIndex(
                                v =>
                                    v.SYS_API_PARAM_ID ===
                                    this.apiParamsIfy.selectRow.SYS_API_PARAM_ID
                            );
                            tblData.splice(rowIndex, 1);
                            this.apiLibraryIfy.tree.activedNode.origin.params = [...tblData];
                            this.apiParamsIfy.evtReset();
                        });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },

        _loadList: () => {
            this.apiParamsIfy.selectRowIndex = -1;
            this.service
                .getParamsList(this.apiLibraryIfy.tree.activedNode.key)
                .subscribe(result => {
                    this.apiLibraryIfy.tree.activedNode.origin.params = result;
                });
        },
    };

    /**
     * 输入参数抽屉
     */
    apiParamsDrawerIfy = {
        // 抽屉内容
        width: 460,
        visible: false,
        title: '输入参数信息',
        close: () => {
            this.apiParamsDrawerIfy.isEdit = false;
            this.apiParamsDrawerIfy.visible = false;
        },
        open: () => {
            this.apiParamsDrawerIfy.visible = true;
        },

        isEdit: false,
        form: new FormGroup({
            // PARAM_API_ID: new FormControl(null, Validators.required),

            PARAM_NAME: new FormControl(null, Validators.required),
            PARAM_IS_NOT_NULL: new FormControl(false, Validators.required),
            PARAM_TYPE: new FormControl(null, Validators.required),
            PARAM_DESC: new FormControl(null),

            SYS_API_ID: new FormControl(null),
            SYS_API_PARAM_ID: new FormControl(null),

            is_Continuous_ADD: new FormControl(null),
        }),

        save: () => {
            if (this.commonService.formVerify(this.apiParamsDrawerIfy.form)) {
                const data = this.apiParamsDrawerIfy.form.getRawValue();
                data.PARAM_API_ID = this.apiLibraryIfy.tree.activedNode.key;

                const tblData = this.apiLibraryIfy.tree.activedNode.origin.params;
                if (this.apiParamsDrawerIfy.isEdit) {
                    this.service.updateParamsData(data).subscribe(result => {
                        const rowIndex = tblData.findIndex(
                            v => v.SYS_API_PARAM_ID === result.SYS_API_PARAM_ID
                        );
                        tblData[rowIndex] = result;
                        this.apiLibraryIfy.tree.activedNode.origin.params = [...tblData];
                        this.apiParamsDrawerIfy.close();
                    });
                    return;
                }

                this.service.addParamsData(data).subscribe(result => {
                    if (tblData) {
                        tblData.push(result);
                        this.apiLibraryIfy.tree.activedNode.origin.params = [...tblData];
                    }
                    if (data.is_Continuous_ADD) {
                        this.apiParamsDrawerIfy.form.reset({
                            PARAM_IS_NOT_NULL: false,
                            is_Continuous_ADD: true,
                        });
                    } else {
                        this.apiParamsDrawerIfy.close();
                    }
                });
            }
        },
    };

    /**
     * api 输出参数
     */
    apiOutParamsIfy = {
        selectRow: null,
        selectRowIndex: -1,
        evtSelectRow: (row, index) => {
            this.apiOutParamsIfy.selectRowIndex = index;
            this.apiOutParamsIfy.selectRow = row;
        },
        evtReset: () => {
            this.apiOutParamsIfy.selectRow = null;
            this.apiOutParamsIfy.selectRowIndex = -1;
        },
        evtAdd: () => {
            this.apiOutParamsDrawerIfy.form.reset();
            this.apiOutParamsDrawerIfy.open();
        },
        evtEdit: () => {
            this.apiOutParamsDrawerIfy.isEdit = true;
            this.apiOutParamsDrawerIfy.form.reset(this.apiOutParamsIfy.selectRow);
            this.apiOutParamsDrawerIfy.open();
        },
        evtDel: () => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除：${this.apiOutParamsIfy.selectRow.OUT_NAME} 吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    this.service
                        .deleteOutParamsData(this.apiOutParamsIfy.selectRow.SYS_API_OUT_ID)
                        .subscribe(result => {
                            const tblData = this.apiLibraryIfy.tree.activedNode.origin.outParams;
                            const rowIndex = tblData.findIndex(
                                v =>
                                    v.SYS_API_OUT_ID ===
                                    this.apiOutParamsIfy.selectRow.SYS_API_OUT_ID
                            );
                            tblData.splice(rowIndex, 1);
                            this.apiLibraryIfy.tree.activedNode.origin.outParams = [...tblData];
                            this.apiOutParamsIfy.evtReset();
                        });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },

        _loadList: () => {
            this.apiOutParamsIfy.selectRowIndex = -1;
            this.service
                .getOutParamsList(this.apiLibraryIfy.tree.activedNode.key)
                .subscribe(result => {
                    this.apiLibraryIfy.tree.activedNode.origin.outParams = result;
                });
        },
    };

    /**
     * api 输出参数抽屉
     */
    apiOutParamsDrawerIfy = {
        // 抽屉内容
        width: 460,
        visible: false,
        title: '输出参数信息',
        close: () => {
            this.apiOutParamsDrawerIfy.isEdit = false;
            this.apiOutParamsDrawerIfy.visible = false;
        },
        open: () => {
            this.apiOutParamsDrawerIfy.visible = true;
        },

        isEdit: false,
        form: new FormGroup({
            // OUT_API_ID: new FormControl(null, Validators.required),

            OUT_NAME: new FormControl(null, Validators.required),
            OUT_TYPE: new FormControl(null, Validators.required),
            OUT_DESC: new FormControl(null),

            SYS_API_OUT_ID: new FormControl(null),

            is_Continuous_ADD: new FormControl(null),
        }),

        save: () => {
            if (this.commonService.formVerify(this.apiOutParamsDrawerIfy.form)) {
                const data = this.apiOutParamsDrawerIfy.form.getRawValue();
                data.OUT_API_ID = this.apiLibraryIfy.tree.activedNode.key;

                const tblData = this.apiLibraryIfy.tree.activedNode.origin.outParams;
                if (this.apiOutParamsDrawerIfy.isEdit) {
                    this.service.updateOutParamsData(data).subscribe(result => {
                        const rowIndex = tblData.findIndex(
                            v => v.SYS_API_OUT_ID === result.SYS_API_OUT_ID
                        );
                        tblData[rowIndex] = result;
                        this.apiLibraryIfy.tree.activedNode.origin.outParams = [...tblData];
                        this.apiOutParamsDrawerIfy.close();
                    });
                    return;
                }

                this.service.addOutParamsData(data).subscribe(result => {
                    if (tblData) {
                        tblData.push(result);
                        this.apiLibraryIfy.tree.activedNode.origin.outParams = [...tblData];
                    }
                    if (data.is_Continuous_ADD) {
                        this.apiOutParamsDrawerIfy.form.reset({
                            is_Continuous_ADD: true,
                        });
                    } else {
                        this.apiOutParamsDrawerIfy.close();
                    }
                });
            }
        },
    };

    /**
     * 模拟数据
     */
    mockDataIfy = {
        selectRow: null,
        selectRowIndex: -1,
        data: [],
        evtSelectRow: (row, index) => {
            this.mockDataIfy.selectRowIndex = index;
            this.mockDataIfy.selectRow = row;
        },
        evtEnableChange: row => {
            const data = {
                DATA_IS_ENABLE: !row.DATA_IS_ENABLE,
                SYS_API_DATA_ID: row.SYS_API_DATA_ID,
                DATA_API_ID: row.DATA_API_ID,
            };
            this.service.updateMockData(data).subscribe(result => {
                const tblData = this.mockDataIfy.data;
                const rowIndex = tblData.findIndex(v => v.SYS_API_OUT_ID === result.SYS_API_OUT_ID);
                tblData[rowIndex] = result;
                this.mockDataIfy.data = [...tblData];
                this.mockDataDrawerIfy.close();
            });
        },
        evtReset: () => {
            this.mockDataIfy.selectRow = null;
            this.mockDataIfy.selectRowIndex = -1;
        },
        evtAdd: () => {
            this.mockDataDrawerIfy.form.reset({
                DATA_IS_ENABLE: false,
            });
            this.mockDataDrawerIfy.open();
        },
        evtEdit: () => {
            this.mockDataDrawerIfy.isEdit = true;
            this.mockDataDrawerIfy.form.reset(this.mockDataIfy.selectRow);
            this.mockDataDrawerIfy.open();
        },
        evtDel: () => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除选中数据吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    this.service
                        .deleteMockData(this.mockDataIfy.selectRow.SYS_API_DATA_ID)
                        .subscribe(result => {
                            const tblData = this.mockDataIfy.data;
                            const rowIndex = tblData.findIndex(
                                v =>
                                    v.SYS_API_DATA_ID === this.mockDataIfy.selectRow.SYS_API_DATA_ID
                            );
                            tblData.splice(rowIndex, 1);
                            this.mockDataIfy.data = [...tblData];
                            this.mockDataIfy.evtReset();
                        });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        _loadList: () => {
            this.service
                .getMockDataList(this.apiLibraryIfy.tree.activedNode.key)
                .subscribe(result => {
                    this.mockDataIfy.data = result;
                });
        },
    };

    /**
     * 模拟数据抽屉
     */
    mockDataDrawerIfy = {
        // 抽屉内容
        width: 560,
        visible: false,
        title: '输出参数信息',
        close: () => {
            this.mockDataDrawerIfy.jsData = null;
            this.mockDataDrawerIfy.isEdit = false;
            this.mockDataDrawerIfy.visible = false;
        },
        open: () => {
            this.mockDataDrawerIfy.visible = true;
        },

        isEdit: false,
        form: new FormGroup({
            // DATA_API_ID: new FormControl(null, Validators.required),

            DATA_JS: new FormControl(null, Validators.required),
            DATA_IS_ENABLE: new FormControl(null),

            SYS_API_DATA_ID: new FormControl(null),
        }),

        save: () => {
            if (this.commonService.formVerify(this.mockDataDrawerIfy.form)) {
                const data = this.mockDataDrawerIfy.form.getRawValue();
                data.DATA_API_ID = this.apiLibraryIfy.tree.activedNode.key;

                const tblData = this.mockDataIfy.data;
                if (this.mockDataDrawerIfy.isEdit) {
                    this.service.updateMockData(data).subscribe(result => {
                        const rowIndex = tblData.findIndex(
                            v => v.SYS_API_DATA_ID === result.SYS_API_DATA_ID
                        );
                        tblData[rowIndex] = result;
                        this.mockDataIfy.data = [...tblData];
                        this.mockDataDrawerIfy.close();
                    });
                    return;
                }

                this.service.addMockData(data).subscribe(result => {
                    if (tblData) {
                        tblData.push(result);
                        this.mockDataIfy.data = [...tblData];
                    }
                    this.mockDataDrawerIfy.close();
                });
            }
        },

        jsData: null,
        evtViewData: () => {
            const { DATA_JS } = this.mockDataDrawerIfy.form.getRawValue();
            const data = Mock.mock(JSON.parse(DATA_JS));
            // 输出结果
            this.mockDataDrawerIfy.jsData = JSON.stringify(data, null, 4);
            // this.mockDataDrawerIfy.jsData = this.sanitizer.bypassSecurityTrustHtml(
            //     JSON.stringify(data, null, 4)
            // );
            console.log(JSON.stringify(data, null, 4));
        },

        eg1: hljs.highlight(
            'json',
            `{
    "code": 0,
    "data": {
        "userId": "@guid",
        "userName": "@cname",
        "email": "@email"
    },
    "msg":  "ok",
    "msgCode": 0
}`
        ).value,
        eg2: hljs.highlight(
            'json',
            `{
    "code": 0,
    "data|10": [{
        "userId": "@guid",
        "userName": "@cname",
        "email": "@email"
    }],
    "msg":  "ok",
    "msgCode": 0
}`
        ).value,
    };

    /**
     * api测试
     */
    apiTestIfy = {
        selectedIndex: 1,
        evtTabChange: ({ index }) => {
            this.apiTestIfy.selectedIndex = index;
        },

        _init: data => {
            this.apiTestIfy.url = data.URL;
            this.apiTestIfy.requestMode = data.API_REQUEST_MODE;
            this.apiTestIfy.request.body = data.API_PARAM;
            this.apiTestIfy.response.body = null;
        },
        url: null,
        headers: {
            data: [
                {
                    enable: true,
                    key: 'Authorization',
                    value: localStorage.getItem(environment.config.PROJECT_NAME_SIGN + '_token'),
                    description: null,
                },
                {
                    enable: true,
                    key: 'X-Auth-Id',
                    value: localStorage.getItem(environment.config.PROJECT_NAME_SIGN + '_id'),
                    description: null,
                },
                {
                    enable: true,
                    key: 'IsTest',
                    value: '1',
                    description:
                        '设置为1，api未完成状态也可以返回真是数据，否则未完成状态只返回模拟数据',
                },
            ],
            evtAdd: () => {
                this.apiTestIfy.headers.data.push({
                    enable: false,
                    key: null,
                    value: null,
                    description: null,
                });
                this.apiTestIfy.headers.data = [...this.apiTestIfy.headers.data];
            },
            evtDel: index => {
                this.apiTestIfy.headers.data = [...this.apiTestIfy.headers.data];
                this.apiTestIfy.headers.data.splice(index, 1);
            },
        },
        requestMode: ApiRequestTypeEnum.GET,
        request: {
            body: null,
            evtBeautifyCode: () => {
                this.apiTestIfy.request.body = JSON.stringify(
                    JSON.parse(this.apiTestIfy.request.body),
                    null,
                    4
                );
            },
        },
        response: {
            body: null,
        },

        evtSend: () => {
            // 获取有效的header
            const headers = {};
            this.apiTestIfy.headers.data
                .filter(v => v.enable && !!v.key && !!v.value)
                .forEach(item => {
                    headers[item.key] = item.value;
                });
            const body = JSON.parse(this.apiTestIfy.request.body || {});
            const method = this.apiRequestTypeList.find(
                v => v.value === this.apiTestIfy.requestMode
            ).text;
            const API_URL = this.apiTestIfy.url;
            const params = {
                API_URL,
                headers,
                body,
            };
            this.service.requestDataByUrl(params).subscribe(result => {
                this.apiTestIfy.response.body = JSON.stringify(result, null, 4);
            });
        },
    };

    constructor(
        private service: ApiLibService,
        private commonService: CommonService,
        private modalService: NzModalService
    ) {}

    ngOnInit() {
        this.apiLibraryIfy._init();
        this.loadApiLibFieldsChange();
    }

    /**
     * 添加api库类型变化监控
     */
    private loadApiLibFieldsChange() {
        this.sysApiDrawerIfy.form
            .get('SYS_NODE_TYPE')
            .valueChanges.pipe(
                filter(value => value > -1 && !this.sysApiDrawerIfy.isEdit),
                distinctUntilChanged(),
                debounceTime(100)
            )
            .subscribe(value => {
                const verifyFields = ['API_URL', 'API_REQUEST_MODE', 'API_STATUS'];
                verifyFields.forEach(field => {
                    const control: AbstractControl = this.sysApiDrawerIfy.form.get(field);
                    if (value === NodeTypeEnum.GENERAL) {
                        control.setValidators(Validators.required);
                    } else {
                        control.clearValidators();
                    }
                });
            });
    }

    /**
     * 请求方式名称
     */
    getRequestModeName(value) {
        const item = this.apiRequestTypeList.find(v => v.value === value);
        return item ? item.text : '';
    }

    /**
     * 获得字段类型
     * @param value 值
     */
    getColumnType(value) {
        const item = this.apiParamTypeList.find(v => v.value === value);
        return item ? item.text : '';
    }

    evtAPIStatusChange(value) {
        const data = {
            API_STATUS: value,
            SYS_API_ID: this.apiLibraryIfy.tree.activedNode.key,
        };
        this.service.updateSysApiData(data).subscribe();
    }
}
