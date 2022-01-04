import CacheOnRedis from 'cache-on-redis'
import { ClientOpts } from 'redis'
import * as mustache from 'mustache'
import {
  CacheCallback,
  CacheKeysValue,
  CacheOptions,
  FunctionWithcache,
  FunctionWithcacheCallback,
  Withcache,
  WithcacheCallback,
} from './interface'

export class CacheOnFunction {
  private cacheService: CacheOnRedis
  private cacheDefault: boolean = true
  constructor(
    redisOptions: ClientOpts,
    options?: {
      key_prefix?: string
      expire_time?: number
      cache_default?: boolean
    }
  ) {
    this.cacheService = new CacheOnRedis(redisOptions, options)
    this.cacheDefault =
      options && options.cache_default != undefined
        ? options.cache_default
        : true
  }

  renderCacheKey<T>(arg: T, funcName: string, key?: string): string {
    if (typeof arg == 'object') {
      if (!key) {
        let _keyByObject = funcName
        Object.keys(arg).map((key) => {
          _keyByObject += `_${key}:${arg[key]}`
        })
        return _keyByObject
      }
      return mustache.render(key, arg)
    }
    if (!key) {
      return `${funcName}_${arg}`
    }
    return mustache.render(key, { arg })
  }

  async<T, R>(
    func: FunctionWithcache<T, Promise<R>>,
    { key, expireAs = 3600 }: CacheOptions = {}
  ): Withcache<T, Promise<R>, Promise<R>, Promise<R>> {
    const withcache = (arg: T): Promise<R> => {
      return new Promise(async (resolve, reject) => {
        try {
          let cacheKey = this.renderCacheKey<T>(arg, func.name, key)
          let data: any = await this.cacheService.getJson(cacheKey)
          if (!data) {
            data = await func(arg)
            await this.cacheService.setJson(cacheKey, data, expireAs)
          }
          resolve(data)
        } catch (err) {
          reject(err)
        }
      })
    }
    const nocache = func
    if (this.cacheDefault) {
      withcache['withcache'] = withcache
      withcache['nocache'] = func
      return withcache as Withcache<T, Promise<R>, Promise<R>, Promise<R>>
    }
    nocache['nocache'] = func
    nocache['withcache'] = withcache
    return nocache as Withcache<T, Promise<R>, Promise<R>, Promise<R>>
  }
  sync<T, R>(
    func: FunctionWithcache<T, R>,
    { key, expireAs = 3600 }: CacheOptions = {}
  ): Withcache<T, Promise<R>, R, Promise<R>> | Withcache<T, Promise<R>, R, R> {
    const withcache = (arg: T): Promise<R> => {
      return new Promise(async (resolve, reject) => {
        try {
          let cacheKey = this.renderCacheKey<T>(arg, func.name, key)
          let data: any = await this.cacheService.getJson(cacheKey)
          if (!data) {
            data = await func(arg)
            await this.cacheService.setJson(cacheKey, data, expireAs)
          }
          resolve(data)
        } catch (err) {
          reject(err)
        }
      })
    }
    const nocache = func
    if (this.cacheDefault) {
      withcache['withcache'] = withcache
      withcache['nocache'] = func
      return withcache as Withcache<T, Promise<R>, R, Promise<R>>
    }
    nocache['nocache'] = func
    nocache['withcache'] = withcache
    return nocache as Withcache<T, Promise<R>, R, R>
  }
  callback<T = any, R = any>(
    func: FunctionWithcacheCallback<T, R>,
    { key, expireAs = 3600 }: CacheOptions = {}
  ): WithcacheCallback<T, R> {
    const withcache = (arg: T, callback: CacheCallback<R>): void => {
      new Promise<R | undefined>(async (resolve, reject) => {
        try {
          let cacheKey = this.renderCacheKey<T>(arg, func.name, key)
          let data: any = await this.cacheService.getJson(cacheKey)
          if (!data) {
            func(arg, (err: any | null, data?: R) => {
              if (err) {
                reject(err)
              } else {
                this.cacheService
                  .setJson(cacheKey, data, expireAs)
                  .then(() => resolve(data))
                  .catch((err) => reject(err))
              }
            })
          } else {
            resolve(data)
          }
        } catch (err) {
          reject(err)
        }
      })
        .then((data?: R) => callback(null, data))
        .catch((err) => callback(err))
    }
    const nocache = func
    if (this.cacheDefault) {
      withcache['withcache'] = withcache
      withcache['nocache'] = func
      return withcache as WithcacheCallback<T, R>
    }
    nocache['nocache'] = func
    nocache['withcache'] = withcache
    return nocache as WithcacheCallback<T, R>
  }
  invalidateCache(
    cacheKey: string | string[],
    keys?: CacheKeysValue | string,
    pattern?: boolean
  ): Promise<void> {
    if (Array.isArray(cacheKey)) {
      const allPromises = cacheKey.map((key) =>
        this.invalidateCache(key, keys, pattern)
      )
      return new Promise((resolve, reject) => {
        Promise.all(allPromises)
          .then(() => resolve())
          .catch((err) => reject(err))
      })
    } else {
      let cacheNameKey: string = cacheKey
      if (keys && typeof keys == 'object') {
        cacheNameKey = mustache.render(cacheKey, keys)
      } else if (keys && typeof keys == 'string') {
        cacheNameKey = mustache.render(cacheKey, { arg: keys, keys })
      }
      return this.cacheService.invalidate(cacheNameKey, pattern)
    }
  }
}
