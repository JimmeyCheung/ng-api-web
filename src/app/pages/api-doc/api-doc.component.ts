import { ActivatedRoute } from '@angular/router';
import { CommonService } from './../../util/common.service';
import { ApiDocService } from './api-doc.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
    NzFormatEmitEvent,
    NzModalService,
    NzTreeComponent,
    NzTreeNode,
    NzMessageService,
} from 'ng-zorro-antd';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NodeTypeEnum, NodeTypeEnum_CN } from 'app/entity/enums/NodeTypeEnum';
import { ApiLibService } from '../api-lib/api-lib.service';
import { ApiStatusEnum, ApiStatusEnum_CN } from 'app/entity/enums/ApiStatusEnum';

import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import { ApiRequestTypeEnum, ApiRequestTypeEnum_CN } from 'app/entity/enums/ApiRequestTypeEnum';
import { ApiParamTypeEnum, ApiParamTypeEnum_CN } from 'app/entity/enums/ApiParamTypeEnum';
hljs.registerLanguage('json', json);

@Component({
    selector: 'app-api-doc',
    templateUrl: './api-doc.component.html',
    styleUrls: ['./api-doc.component.scss'],
})
export class ApiDocComponent implements OnInit {
    nodeTypeEnum = NodeTypeEnum;
    nodeTypeList = NodeTypeEnum_CN;

    apiRequestTypeEnum = ApiRequestTypeEnum;
    apiRequestTypeList = ApiRequestTypeEnum_CN;

    apiParamTypeEnum = ApiParamTypeEnum;
    apiParamTypeList = ApiParamTypeEnum_CN;

    apiStatusEnum = ApiStatusEnum;
    apiStatusList = ApiStatusEnum_CN;
    /**
     * 权限管理对象
     */
    permission = <any>{};

    /**
     * 头部操作
     */
    headHandleIfy = {
        evtAdd: () => {
            this.sysGroupDrawerIfy.form.reset({
                SYS_NODE_TYPE: NodeTypeEnum.TREE,
            });
            this.sysGroupDrawerIfy.open();
        },
        evtEdit: () => {
            this.sysGroupDrawerIfy.isEdit = true;
            const { origin } = this.apiGroupIfy.tree.activedNode;
            this.sysGroupDrawerIfy.form.reset(origin);
            this.sysGroupDrawerIfy.open();
        },
        evtDel: () => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除：${this.apiGroupIfy.tree.activedNode.title} 吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    this.service
                        .deleteApiGroupData(this.apiGroupIfy.tree.activedNode.key)
                        .subscribe(result => {
                            this.apiGroupIfy.tree.activedNode.remove();
                            const parentNode = this.apiGroupIfy.tree.activedNode.parentNode;
                            if (parentNode && parentNode.getChildren().length === 0) {
                                parentNode.isLeaf = true;
                                parentNode.isExpanded = false;
                            } else {
                                if (!parentNode) {
                                    this.apiGroupIfy.tree.nodes.splice(
                                        this.apiGroupIfy.tree.nodes.findIndex(
                                            item =>
                                                item.key === this.apiGroupIfy.tree.activedNode.key
                                        ),
                                        1
                                    );
                                    this.apiGroupIfy.tree.nodes = [...this.apiGroupIfy.tree.nodes];
                                }
                            }
                            this.apiGroupIfy.tree.activedNode = null;
                        });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },

        evtAddAPI: () => {
            this.apiLibDrawerIfy.open();
        },
    };

    @ViewChild('apiGroupTreeElement', { static: false }) apiGroupTreeElement: NzTreeComponent;
    /**
     * api库分组
     */
    apiGroupIfy = {
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
                        this.apiGroupIfy.find.parentList = result;

                        const nodes = this.apiGroupTreeElement.getTreeNodes();
                        this.apiGroupIfy.tree._selectedLocationTree(nodes, value);
                    });
                }
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.service
                        .selectListByQuery({
                            GROUP_NAME: searchKey,
                        })
                        .subscribe(result => {
                            this.apiGroupIfy.find.list = result;
                        });
                }
            },
        },

        tree: {
            nodes: [],
            icons: ['sitemap', 'file-o'],
            activedNode: <NzTreeNode>{},
            evtActiveNode: (data: NzFormatEmitEvent) => {
                this.apiGroupIfy.tree.activedNode = data.node;
                this.apiGroupIfy.tree._locationedContinue();
            },
            evtExpandChange: (event: Required<NzFormatEmitEvent>) => {
                if (event.eventName === 'expand') {
                    const node = event.node;

                    if (node && node.getChildren().length === 0 && node.isExpanded) {
                        this.service
                            .getApiGroupList(node.key)
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
                        this.apiGroupIfy.tree.activedNode = node;
                        this.apiGroupIfy.tree._locationedContinue();
                        // this.apiLibraryIfy.tree._locationedScroll();
                    } else {
                        const isExist =
                            this.apiGroupIfy.find.parentList.findIndex(v => v.value === node.key) >
                            -1;
                        if (isExist) {
                            node.isExpanded = true;
                            // 有子节点并且未取出来
                            if (!node.isLeaf && node.getChildren().length === 0) {
                                const childNodes = await this.apiGroupIfy.tree._asyncLoadNodeChildNode(
                                    node
                                );
                                node.addChildren(childNodes);
                            }
                            if (node.getChildren().length > 0) {
                                this.apiGroupIfy.tree._selectedLocationTree(
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
                return this.service.getApiGroupList(node.key).toPromise();
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
                const { origin } = this.apiGroupIfy.tree.activedNode;
                switch (origin.SYS_NODE_TYPE) {
                    case NodeTypeEnum.TREE:
                        this.loadGroupAPIList();
                        break;
                    case NodeTypeEnum.GENERAL:
                        this.loadAPIInfo();
                        break;
                }
            },
        },

        _init: () => {
            this.service
                .getApiGroupList()
                .subscribe(nodes => (this.apiGroupIfy.tree.nodes = nodes));
        },
    };

    /**
     * 分组抽屉
     */
    sysGroupDrawerIfy = {
        // 抽屉内容
        width: 460,
        visible: false,
        title: '系统函数信息',
        close: () => {
            this.sysGroupDrawerIfy.isEdit = false;
            this.sysGroupDrawerIfy.visible = false;
        },
        open: () => {
            this.sysGroupDrawerIfy.visible = true;
        },
        isEdit: false,
        form: new FormGroup({
            GROUP_API_ID: new FormControl(null),

            GROUP_NAME: new FormControl(null, Validators.required),
            SYS_NODE_TYPE: new FormControl(null, Validators.required),

            SYS_API_GROUP_ID: new FormControl(null),
            isTop: new FormControl(null),
        }),

        save: () => {
            if (this.commonService.formVerify(this.sysGroupDrawerIfy.form)) {
                const data = this.sysGroupDrawerIfy.form.getRawValue();
                if (this.sysGroupDrawerIfy.isEdit) {
                    this.service.updateApiGroupData(data).subscribe(node => {
                        this.apiGroupIfy.tree.activedNode.origin = {
                            ...this.apiGroupIfy.tree.activedNode.origin,
                            ...node,
                        };
                        this.apiGroupIfy.tree.activedNode.title = node.title;
                        this.sysGroupDrawerIfy.close();
                    });
                    return;
                }
                if (!data.isTop && this.apiGroupIfy.tree.activedNode.key) {
                    data.SYS_PARENT = this.apiGroupIfy.tree.activedNode.key;
                } else {
                    data.SYS_PARENT = '-1';
                }
                this.service.addApiGroupData(data).subscribe(node => {
                    if (data.SYS_PARENT === '-1') {
                        this.apiGroupIfy.tree.nodes.push(node);
                        this.apiGroupIfy.tree.nodes = [...this.apiGroupIfy.tree.nodes];
                    } else {
                        this.apiGroupIfy.tree.activedNode.isLeaf = false;
                        if (this.apiGroupIfy.tree.activedNode.isExpanded) {
                            this.apiGroupIfy.tree.activedNode.addChildren([node]);
                        }
                    }
                    this.sysGroupDrawerIfy.close();
                });
            }
        },
    };

    @ViewChild('apiLibTreeElement', { static: false }) apiLibTreeElement: NzTreeComponent;
    /**
     * api库抽屉
     */
    apiLibDrawerIfy = {
        // 抽屉内容
        width: 400,
        visible: false,
        title: 'API库',
        close: () => {
            this.apiLibDrawerIfy.visible = false;
        },
        open: () => {
            this.apiLibraryIfy._init();
            this.apiLibDrawerIfy.visible = true;
        },

        save: () => {
            const list = this.apiLibTreeElement.getCheckedNodeList();
            const dataList = [];
            this.getCheckedNotList(list, dataList);
            if (dataList.length === 0) {
                this.message.warning('未选择有效api。');
                return;
            }

            this.service.saveApiInsertList(dataList).subscribe(result => {
                this.apiGroupIfy.tree.activedNode.isLeaf = false;
                if (this.apiGroupIfy.tree.activedNode.isExpanded) {
                    this.apiGroupIfy.tree.activedNode.addChildren(result);
                }
                this.apiLibDrawerIfy.close();
            });
        },
    };

    /**
     * api库分组
     */
    apiLibraryIfy = {
        find: {
            // 搜索框
            searchWidth: 380,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: <any>[],
            parentList: <any>[],
            selectedIndex: -1,
            change: (value: string) => {
                if (value) {
                    this.apiLibService.getApiParentAllList(value).subscribe(result => {
                        this.apiLibraryIfy.find.parentList = result;

                        const nodes = this.apiLibTreeElement.getTreeNodes();
                        this.apiLibraryIfy.tree._selectedLocationTree(nodes, value);
                    });
                }
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.apiLibService
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
            activedNode: null,
            evtActiveNode: (data: NzFormatEmitEvent) => {
                this.apiLibraryIfy.tree.activedNode = data.node;
                // if (
                //     this.apiLibraryIfy.tree.activedNode.origin.SYS_NODE_TYPE ===
                //     NodeTypeEnum.GENERAL
                // ) {
                //     this.apiTabIfy.evtChange({ index: this.apiTabIfy.selectedIndex });
                // }
            },
            evtExpandChange: (event: Required<NzFormatEmitEvent>) => {
                if (event.eventName === 'expand') {
                    const node = event.node;

                    if (node && node.getChildren().length === 0 && node.isExpanded) {
                        this.apiLibService
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
                return this.apiLibService.getSysApiList(node.key).toPromise();
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
            _locationedContinue: () => {},
        },

        _init: () => {
            if (this.apiLibraryIfy.tree.nodes.length > 0) {
                return;
            }
            this.apiLibService
                .getSysApiList()
                .subscribe(nodes => (this.apiLibraryIfy.tree.nodes = nodes));
        },
    };

    apiTableIfy = {
        data: [],
    };

    apiInfoIfy = {
        data: null,
    };

    constructor(
        private service: ApiDocService,
        private commonService: CommonService,
        private modalService: NzModalService,
        private activatedRoute: ActivatedRoute,
        private apiLibService: ApiLibService,
        private message: NzMessageService
    ) {}

    ngOnInit() {
        this.apiGroupIfy._init();

        /**
         * 获取账号权限
         */
        this.activatedRoute.data.subscribe((data: { tag: string }) => {
            const menus = this.commonService.getNavigeList();
            const menu = menus.find(item => item.SYSTEM_RESOURCE_GUARD_ID === data.tag);
            let permission: any;
            if (menu) {
                permission = menus.filter(item => item.SYS_PARENT === menu.SYSTEM_RESOURCE_TREE_ID);
                permission.forEach(item => {
                    this.permission[item.SYSTEM_RESOURCE_GUARD_ID] = true;
                });
                console.dir(this.permission);
            }
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
    getColumnTypeName(value) {
        const item = this.apiParamTypeList.find(v => v.value === value);
        return item ? item.text : '';
    }

    /**
     * 获得api状态名称
     */
    getApiStatusName(value) {
        const item = this.apiStatusList.find(v => v.value === value);
        return item ? item.text : '';
    }

    /**
     * 查看找api节点
     */
    getCheckedNotList(list: NzTreeNode[], ll: any[]) {
        list.forEach(node => {
            if (node.origin.SYS_NODE_TYPE === NodeTypeEnum.GENERAL) {
                ll.push({
                    GROUP_NAME: node.title,
                    GROUP_API_ID: node.key,
                    SYS_PARENT: this.apiGroupIfy.tree.activedNode.key,
                    SYS_NODE_TYPE: NodeTypeEnum.GENERAL,
                });
            }
            if (!node.isLeaf && node.children.length > 0) {
                this.getCheckedNotList(node.children, ll);
            }
        });
    }

    /**
     * 加载分组api列表
     */
    loadGroupAPIList() {
        this.service.getGroupAPIList(this.apiGroupIfy.tree.activedNode.key).subscribe(result => {
            this.apiTableIfy.data = result;
        });
    }

    /**
     * 加载api基本信息
     */
    loadAPIInfo() {
        const { origin } = this.apiGroupIfy.tree.activedNode;
        this.apiLibService.getApiData(origin.GROUP_API_ID).subscribe(result => {
            result.API_PARAM_CODE = hljs.highlight('json', result.API_PARAM).value;
            result.API_RETURN_CODE = hljs.highlight('json', result.API_RETURN).value;
            this.apiInfoIfy.data = result;

            this.apiLibService.getParamsList(origin.GROUP_API_ID).subscribe(params => {
                this.apiInfoIfy.data.params = params;
            });
            this.apiLibService.getOutParamsList(origin.GROUP_API_ID).subscribe(outParams => {
                this.apiInfoIfy.data.outParams = outParams;
            });
        });
    }
}
