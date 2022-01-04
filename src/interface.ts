export type FunctionWithcache<T, R> = (arg: T) => R
export interface Withcache<T, RC, RNC, RO> extends FunctionWithcache<T, RO> {
  nocache: (arg: T) => RNC
  withcache: (arg: T) => RC
}
export type CacheCallback<T> = (err: any | null, data?: T) => void
export type FunctionWithcacheCallback<T, R> = (
  arg: T,
  cb: CacheCallback<R>
) => void
export interface WithcacheCallback<T, RO>
  extends FunctionWithcacheCallback<T, RO> {
  withcache: (arg: T, cb: CacheCallback<RO>) => void
  nocache: (arg: T, cb: CacheCallback<RO>) => void
}

export interface CacheOptions {
  key?: string
  expireAs?: number
}

export interface CacheKeysValue {
  [name: string]: string
}
