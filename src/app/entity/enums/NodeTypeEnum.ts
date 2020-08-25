/**
 * 节点类型
 */
export enum NodeTypeEnum {
    /**
     * 分组节点
     */
    TREE,
    /**
     * 普通节点
     */
    GENERAL,
}

/**
 * 节点类型对应中文
 */
// tslint:disable-next-line:variable-name
export const NodeTypeEnum_CN = [
    { text: '分组节点', value: 0 },
    { text: '普通节点', value: 1 },
];
