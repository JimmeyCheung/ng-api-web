/**
 * api状态
 */
export enum ApiStatusEnum {
    /**
     * 设计
     */
    DESIGN = 0,
    /**
     * 开发
     */
    DEVELOP = 1,
    /**
     * 测试
     */
    TEST = 2,
    /**
     * 完成
     */
    COMPLETE = 3,
    /**
     * 修改
     */
    MODIFY = 4,
    /**
     * 废弃
     */
    DISCARD = 5,
}

/**
 * api状态对应中文
 */
export const ApiStatusEnum_CN = [
    { text: '设计', value: 0 },
    { text: '开发', value: 1 },
    { text: '测试', value: 2 },
    { text: '完成', value: 3 },
    { text: '修改', value: 4 },
    { text: '废弃', value: 5 },
];
