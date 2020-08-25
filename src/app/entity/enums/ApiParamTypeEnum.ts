/**
 * 参数类型
 */
export enum ApiParamTypeEnum {
    /**
     * 字符型
     */
    CHAR,
    /**
     * 长整型
     */
    LONG,
    /**
     * 数值型
     */
    NUMBER,
    /**
     * 布尔型
     */
    BOOLEAN,
    /**
     * 日期型
     */
    DATETIME,
    /**
     * 对象
     */
    OBJECT,
}

/**
 * 参数类型 对应中文
 */
export const ApiParamTypeEnum_CN = [
    { text: '字符型', value: 0 },
    { text: '长整型', value: 1 },
    { text: '数值型', value: 2 },
    { text: '布尔型', value: 3 },
    { text: '日期型', value: 4 },
    { text: '对象', value: 5 },
];
