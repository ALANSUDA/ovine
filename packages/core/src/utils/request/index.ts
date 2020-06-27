/**
 * 封装 fetch 请求
 */

/* eslint-disable consistent-return */
import { object2formData, qsstringify, hasFile } from 'amis/lib/utils/helper'
import { filter } from 'amis/lib/utils/tpl'
import { get, isPlainObject, isFunction, omitBy } from 'lodash'
import map from 'lodash/map'
import { fetch } from 'whatwg-fetch'

import logger from '@/utils/logger'
import { getSessionStore, setSessionStore } from '@/utils/store'
import { isExpired, getQuery, timeout } from '@/utils/tool'

import * as Types from './types'

const log = logger.getLogger('lib:utils:request')

// 请求错误集中处理， 必须 throw 错误
function requestErrorCtrl(this: Request, error: Error, option: Types.ReqOption, response?: any) {
  const { onError } = option

  log.info('requestErrorCtrl', { error, option, response })

  const errorSource = { option, response, error }

  let withInsErrorHook = true

  // 如果返回 false，则不调用 全局的错误处理
  if (onError) {
    withInsErrorHook = !!onError(response, option, error)
  }

  if (withInsErrorHook !== false && this.onError) {
    this.onError(response, option, error)
  }

  if (this.onFinish) {
    this.onFinish(response, option, error)
  }

  throw errorSource
}

// 请求成功集中处理
async function requestSuccessCtrl(this: Request, response: any, option: Types.ReqOption) {
  if (this.onSuccess) {
    const res = wrapResponse(response)
    const resData = await this.onSuccess(res.data, option, res)
    response.data = resData
  }

  if (option.onSuccess) {
    const res = wrapResponse(response)
    const resData = await option.onSuccess(res.data, option, res)
    response.data = resData
  }

  if (this.onFinish) {
    this.onFinish(wrapResponse(response), option)
  }
}

// 模拟数据
async function mockSourceCtrl(this: Request, option: Types.ReqOption) {
  const { mockSource, api, url, mock = true, mockDelay = 300 } = option

  if (this.isRelease || !mock || !mockSource) {
    return 'none'
  }

  const apiStr = api || url || ''

  // mock数据生成方式
  const mockSourceGen = get(mockSource, apiStr) ? (mockSource as any)[apiStr] : mockSource

  // mock 原始数据
  const origin: any = isFunction(mockSourceGen) ? mockSourceGen(option) : mockSourceGen
  const fakeRes: any = { data: origin }

  await requestSuccessCtrl.call(this, fakeRes, option)

  if (mockDelay) {
    await timeout(mockDelay)
  }

  log.log('mockSource', option.url, fakeRes.data, option)

  return fakeRes
}

// 只缓存 GET 请求
function cacheSourceCtrl(type: 'set' | 'get', option: Types.ReqOption, resource?: any) {
  const { url = '', expired = 0, method = 'GET' } = option || {}

  if (!expired || method !== 'GET') {
    return
  }

  const timestampKey: any = `${url}:timestamp`

  if (type === 'set') {
    // 不存在 resource 直接返回
    if (!resource) {
      return
    }
    // 所有数据按照 字符串缓存
    setSessionStore(url, resource)
    setSessionStore(timestampKey, (Date.now() + expired).toString())
    return
  }

  if (type === 'get') {
    const cached = getSessionStore(url)
    const whenExpired = getSessionStore<string>(timestampKey)

    if (cached && whenExpired) {
      if (!isExpired(whenExpired)) {
        log.log('cacheSource', option.url, cached, option)
        return cached
      }
    }
  }
}

// 发出 fetch 请求
async function fetchSourceCtrl(this: Request, option: Types.ReqOption) {
  const { url, onUploadProgress, body, config = {} } = option

  if (
    (onUploadProgress || config?.onUploadProgress) &&
    body &&
    typeof XMLHttpRequest !== 'undefined'
  ) {
    const result = await uploadWithProgress.call(this, option)
    return result
  }

  const result = await fetch(url, option)
    .catch((error: any) => {
      requestErrorCtrl.call(this, error, option, wrapResponse())
    })
    .then(async (response: any) => {
      // 当 fetch 发生错误时 不做任何处理
      if (!response) {
        return
      }

      const status = Number(response.status)

      try {
        const origin = await response.json()

        response.data = origin

        if (status <= 100 || status >= 400) {
          requestErrorCtrl.call(
            this,
            new Error('status <= 100 || status >= 400'),
            option,
            wrapResponse(response)
          )
          return
        }

        await requestSuccessCtrl.call(this, response, option)

        return response
      } catch (error) {
        requestErrorCtrl.call(this, error, option, wrapResponse(response))
      }
    })

  return result
}

// fetch 不支持 onUploadProgress, 使用用原生的 xhr
function uploadWithProgress(this: Request, option: Types.ReqOption) {
  const errorCtrl = requestErrorCtrl.bind(this)
  const successCtrl = requestSuccessCtrl.bind(this)

  return new Promise((resolve) => {
    const { onUploadProgress, config, method = '', url = '', headers = {}, body } = option
    const uploadProgress = config.onUploadProgress || onUploadProgress

    let xhr: XMLHttpRequest | null = new XMLHttpRequest()

    xhr.open(method.toLowerCase(), url, true)

    map(headers, (header, key) => {
      if (xhr) {
        xhr.setRequestHeader(key, header)
      }
    })

    function onXhrError(this: any, text: string) {
      errorCtrl(
        new Error(text),
        option,
        wrapResponse(
          {
            data: xhr?.response || xhr?.responseText,
            status: this.status,
            statusText: xhr?.statusText,
          },
          true
        )
      )
      xhr = null
    }

    xhr.onreadystatechange = function() {
      if (!xhr || xhr.readyState !== 4) {
        return
      }
      if (xhr.status === 0 && !(xhr.responseURL && xhr.responseURL.indexOf('file:') === 0)) {
        return
      }

      const responseHeaders = xhr?.getAllResponseHeaders() || {}
      const response: any = {
        data: xhr.response || xhr.responseText,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: responseHeaders,
      }

      if (this.status <= 100 || this.status >= 400) {
        errorCtrl(new Error('status <= 100 || status >= 400'), option, wrapResponse(response, true))
      } else {
        successCtrl(wrapResponse(response, true), option).then(() => {
          resolve(response)
        })
      }
    }

    xhr.onerror = function() {
      onXhrError.call(this, 'Network Error')
    }

    xhr.ontimeout = function() {
      onXhrError.call(this, 'TimeOut Error')
    }

    if (xhr.upload && uploadProgress) {
      xhr.upload.onprogress = uploadProgress
    }

    xhr.send(body)
  })
}

// 获取 fetch 参数
function getFetchOption(this: Request, option: Types.ReqOption): any {
  const { headers = {}, data, body, fetchOptions, contentType = 'json', qsOptions } = option

  const { url, method } = getUrlByOption.call(this, option) as any
  const qsOpts = {
    encode: false,
    arrayFormat: 'indices',
    encodeValuesOnly: false,
    ...qsOptions,
  }

  // 自行实现取消请求的回调
  const { cancelExecutor } = option.config || {}

  let signal = null
  if (cancelExecutor && typeof AbortController !== 'undefined') {
    const controller = new AbortController()
    signal = controller.signal
    cancelExecutor(() => {
      controller.abort()
    })
  }

  // fetch 请求参数封装
  let fetchBody = body
  const fetchHeaders = headers
  if (!fetchBody && data && !/GET|HEAD|OPTIONS/.test(method)) {
    if (data instanceof FormData || data instanceof Blob || data instanceof ArrayBuffer) {
      fetchBody = data
    } else if (hasFile(data) || contentType === 'form-data') {
      fetchBody = object2formData(data, qsOpts)
    } else if (contentType === 'form') {
      fetchBody = typeof data === 'string' ? data : qsstringify(data, qsOpts)
      fetchHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
    } else if (contentType === 'json') {
      fetchBody = typeof data === 'string' ? data : JSON.stringify(data)
      fetchHeaders['Content-Type'] = 'application/json'
    }
  }

  const fetchOption = {
    ...fetchOptions,
    signal,
    url,
    method,
    headers: fetchHeaders,
    body: fetchBody,
    credentials: 'include',
  }

  return fetchOption
}

// 确保 data 一定是对象
function wrapResponse(response?: any, transJson?: boolean) {
  if (!response) {
    const fakeRes: any = { data: {} }
    return fakeRes
  }
  if (typeof response.data === 'undefined') {
    response.data = {}
  } else if (!isPlainObject(response.data)) {
    if (!transJson) {
      response.data = { value: response.data }
      return response
    }
    try {
      response.data = JSON.parse(response.data)
      return response
    } catch (_) {
      //
    }
  }

  return response
}

// 获取请求参数
async function getReqOption(this: Request, option: Types.ReqOption): Promise<Types.ReqOption> {
  const { data: params, url = '', actionAddr, api, onPreRequest, onRequest } = option
  let opt = option

  opt.api = api || url
  opt.actionAddr = actionAddr || opt.api

  if (!option.api) {
    log.error('request option.api 不存在', option)
    requestErrorCtrl.call(this, new Error('option.api 不存在'), wrapResponse())
  }

  const query: any = url && getQuery('', url)

  if (query) {
    if (url) {
      opt.url = url.split('?')[0] // eslint-disable-line
    }
    opt.data = { ...query, ...params }
  }

  if (this.onPreRequest) {
    opt = await this.onPreRequest(opt)
  }

  if (onPreRequest) {
    opt = await onPreRequest(opt)
  }

  let reqOption = { ...opt, ...getFetchOption.call(this as any, opt) }

  if (this.onRequest) {
    reqOption = await this.onRequest(reqOption)
  }
  if (onRequest) {
    reqOption = await onRequest(reqOption)
  }

  return reqOption
}

// 获取url参数
export function getUrlByOption(
  this: Types.ReqConfig,
  option: Types.ReqOption & Partial<Types.ReqConfig>
) {
  const { url = '', qsOptions, data, method = 'GET', domain = 'api', domains } = option

  let realUrl = url

  const urlOption = { url, method: method.toUpperCase() }
  const qsOpts = {
    encode: false,
    arrayFormat: 'indices',
    encodeValuesOnly: false,
    ...qsOptions,
  }

  if (/[GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS] /.test(realUrl)) {
    const [apiMethod, apiStr] = realUrl.split(' ')
    urlOption.method = apiMethod as Types.ReqMethod
    realUrl = apiStr
  }

  const apiDomains = domains || this.domains || {}

  // url中不存在 '//' 匹配
  if (!/\/\//.test(realUrl)) {
    const urlPrefix = apiDomains[domain]
    if (!urlPrefix) {
      log.error('request.getUrlByOption 解析出错', option)
    }
    realUrl = `${urlPrefix}/${realUrl}`
  }

  // 存在模版标记 tag
  if (/\$/.test(realUrl)) {
    realUrl = filter(realUrl, data)
  }

  if (urlOption.method === 'GET' && isPlainObject(data)) {
    // 过滤无效重复 查询参数
    const queryParams = omitBy(data, (item, key) => {
      const isNull = item === undefined || item === null || item === 'undefined' || item === ''
      const queryStr = realUrl.split('?')[1] || ''
      if (isNull || queryStr.indexOf(`${key}=`) > -1) {
        return true
      }
    })

    realUrl += `${realUrl.indexOf('?') === -1 ? '?' : '&'}${qsstringify(queryParams, qsOpts)}`
  }

  urlOption.url = realUrl

  return urlOption
}

// 使用 class 能够更容易重写 request 的一些回调值
export class Request<IS = {}, IP = {}> {
  constructor(config?: Types.ReqConfig) {
    this.setConfig(config)
  }

  // 配置的域名
  public domains: { [domain: string]: string } = {}

  // 是否是 发版环境
  public isRelease?: boolean

  // 请求预处理阶段
  public onPreRequest?: (option: Types.ReqOption) => Types.ReqOption

  // 发送请求前
  public onRequest?: (option: Types.ReqOption) => Types.ReqOption

  // 错误回调
  public onError?: (response: Types.ReqResponse, option: Types.ReqOption, error: Error) => void

  // 请求成功回调
  public onSuccess?: (data: any, option: Types.ReqOption, response: Types.ReqResponse) => any

  // 请求结束回调
  public onFinish?: (response: Types.ReqResponse, option: Types.ReqOption, error?: Error) => void

  // 设置配置
  public setConfig(config?: Types.ReqConfig) {
    const { domains = {}, isRelease } = config || {}
    this.domains = domains
    this.isRelease = isRelease
  }

  // 解析请求参数
  public getUrlByOption(option: Types.ReqOption<IS, IP>) {
    return getUrlByOption.call(this, option as any)
  }

  // 请求
  public async request<S = {}, P = {}>(
    option: Types.ReqOption<S | IS, P | IP>
  ): Promise<Types.ReqResponse<S | IS> | undefined>

  // eslint-disable-next-line no-dupe-class-members
  public async request(option: any): Promise<any> {
    const reqOption = await getReqOption.call(this as any, option)

    // 命中缓存 直接返回
    const cachedResponse = cacheSourceCtrl('get', reqOption)
    if (cachedResponse) {
      return {
        data: cachedResponse,
      }
    }

    // mock数据拦截
    const mockSource = await mockSourceCtrl.call(this as any, reqOption)
    if (mockSource !== 'none') {
      cacheSourceCtrl('set', reqOption, mockSource.data)
      return mockSource
    }

    const response = await fetchSourceCtrl.call(this as any, reqOption)

    cacheSourceCtrl('set', reqOption, response.data)

    log.log('[apiSource]', reqOption.url, response.data, reqOption)

    return response
  }
}
