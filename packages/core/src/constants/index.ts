/**
 * 项目内常量,禁止重新赋值修改
 */

export const publicUrl = process.env.PUBLIC_PATH || '/'
export const routeLimitKey = '$page'
export const appRootId = 'app-root'
export const defaultEnvMode = 'localhost'
export const coreStatic = `${publicUrl}static/ovine/core`
export const strDelimiter = '@##@'

// 屏幕尺寸定义
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
}

// 消息通知相关的 key
export const message = {
  storeRoot: '$store/',
  layoutSpinner: '$store/layoutSpinner',
  appTheme: 'appThemeMsg',
  appLang: 'appLangMsg',
  updateRouteStore: 'updateRouteStoreMsg',
  dev: {
    hot: 'hotReloadMsg',
  },
}

// 存储相关的 key
export const storage = {
  appInstance: 'appInstanceStore',
  userInfo: 'userInfoStore',
  appTheme: 'appThemeStore',
  appLimit: 'appLimitStore',
  dev: {
    code: 'devCodeGlobal',
    limit: 'devLimitStore',
    api: 'devApiStore',
  },
}
