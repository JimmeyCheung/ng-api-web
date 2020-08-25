// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    config: {
        // 系统名称
        PROJECT_NAME: 'Jimmey-API文档工具',
        // 系统名称简拼
        PROJECT_NAME_SIGN: 'ng-api-project',
        // 项目根目录
        PROJECT_PATH_ROOT: 'ng-api',
        // 项目编码
        PROJECT_CODE: '001',
        // 项目内容相关设置
        AppSettings: {
            // 后端约定密码加密key
            NB_NETWORK_CONFIG_DESKey: 'jimmey-password',
            /**
             * 后台导航分组
             */
            RESOURCE_GROUP_ID: '745226396476903424',
        },
    },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
