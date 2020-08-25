/**
 * 后端返回的数据类型
 *
 * @export
 * @interface R
 */
export interface R {
    /**
     * 是否请求成功
     *
     * @type {number} 0：成功， 其他失败
     * @memberof R
     */
    code: number;
    msgCode: number;
    /**
     * 错误信息
     *
     * @type {string} 错误信息
     * @memberof R
     */
    msg: string;
    data: any;
}
