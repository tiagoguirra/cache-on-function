import * as mustache from 'mustache'

export const renderCacheKey = <T>(
  arg: T,
  funcName: string,
  key?: string
): string => {
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
