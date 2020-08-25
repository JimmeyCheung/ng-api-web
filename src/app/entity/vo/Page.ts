export class Page<T> {
    /**
     * 当前页
     */
    pageIndex: number;
    /**
     * 每页记录数
     */
    pageSize: number;
    /**
     * 总记录数
     */
    totalCount?: number;
    /**
     * 查询结果集
     */
    result?: T[];

    [key: string]: any;
}
