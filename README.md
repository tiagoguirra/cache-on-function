# cache-on-function

Cache on function is a simple library to implement caching over a function easily and without changes to the original function.


## Install

```bash
$ npm install cache-on-function
```

## Usage

Then create a cache-on-function instance passing redis and cache options:

```javascript
const { CacheOnFunction } = require('cache-on-function')
const cacheEngine = new CacheOnFunction({
  host: 'localhost',
  port: 6379,
  connect_timeout: 3600000,
  retry_strategy: (options) => {
    return 2000
  },
},{
    cache_default: true,
    expire_time: 6000,
    key_prefix: 'cache-on-function',
})
```

##### create cache over async function

Create asynchronous function with you implementation;
> The only requirement is that the function only takes one argument, it is necessary to pass an object if it needs multiple arguments.

```javascript
const myAsyncFunction = ({arga,argb})=>{
  return new Promise((resolve,reject)=> {
    resolve('Resolved')
  })
}
```
Creates a layer surrounding the function
```javascript
const myFunctionWithCache = cacheEngine.async(myAsyncFunction)
```

Call a function with cache the same way called original function

```javascript
await myFunctionWithCache({arga:'Argment a',argb: 'Argument b'})
```

If you define default cache as True, the simple call will usage cache by default, but is possible call function without cache

```javascript
await myFunctionWithCache.nocache({arga:'Argment a',argb: 'Argument b'})
```

If you define default cache as False, the simple call will not use cache by default, but is possible call function with cache

```javascript
await myFunctionWithCache.withcache({arga:'Argment a',argb: 'Argument b'})
```

##### create cache over sync function

Create synchronous function with you implementation
> The function only takes one argument, it is necessary to pass an object if it needs multiple arguments.
> The function with cache will return a promise, then need resolve promise to receive value


```javascript
const mySyncFunction = ({arga,argb})=>{
  return 'My sync response'
}
```
Creates a layer surrounding the function
```javascript
const myFunctionWithCache = cacheEngine.sync(mySyncFunction)
```

If you define default cache as True, simple call will return cache function as promise, else return original function synchronous

```javascript
await myFunctionWithCache({arga:'Argment a',argb: 'Argument b'})
```

If you define default cache as True, the simple call will usage cache by default, but is possible call function without cache
> Note that in this case the original function will be called so it will return the synchronous response

```javascript
myFunctionWithCache.nocache({arga:'Argment a',argb: 'Argument b'})
```

If you define default cache as False, the simple call will not use cache by default, but is possible call function with cache

```javascript
await myFunctionWithCache.withcache({arga:'Argment a',argb: 'Argument b'})
```

##### create cache over callback function

Create callback function with you implementation
> The function only takes one argument, it is necessary to pass an object if it needs multiple arguments.
> The function cache and no cache will response using callback.


```javascript
const myCbFunction = ({arga,argb},callback = (err,data)=>{})=>{
  callback(null,'My sync response')
}
```
Creates a layer surrounding the function
```javascript
const myCbFunctionWithCache = cacheEngine.callback(myCbFunction)
```

Call a function with cache the same way called a original function

```javascript
myCbFunctionWithCache({arga:'Argment a',argb: 'Argument b'},(err,data)=>{
  if (err) console.log('Error',err)
  else console.log('Response',data)
})
```

If you define default cache as True, the simple call will usage cache by default, but is possible call function without cache

```javascript
myCbFunctionWithCache.nocache({arga:'Argment a',argb: 'Argument b'},(err,data)=>{
  if (err) console.log('Error',err)
  else console.log('Response',data)
})
```

If you define default cache as False, the simple call will not use cache by default, but is possible call function with cache

```javascript
myCbFunctionWithCache.withcache({arga:'Argment a',argb: 'Argument b'},(err,data)=>{
  if (err) console.log('Error',err)
  else console.log('Response',data)
})
```


##### Invalidate function cache

By default caches will expire after time, but you can invalidate using a combination with function name and parameters, predefined key on surrounding function or using patterns

Invalidate using name function and paramters
> Use the original name of function before surrounding cache

```javascript
await cacheEngine.invalidateCache('mySyncFunction',{arga:'Argment a',argb: 'Argument b'})
```

Invalidate using key predefined on surrounding function

On surrounding function define key
> Note you can use arguments name to composite a cache key, use 'mey_custom_key_{{name_of_argument}}'
```javascript
const myFunctionWithCache = cacheEngine.async(myAsyncFunction, {key: 'mey_custom_key'})
```
Then invalidate cache using custom key

```javascript
await cacheEngine.invalidateCache('mey_custom_key')
```

Invalidate using patters
> This way can be used for function original name or custom key

```javascript
await cacheEngine.invalidateCache('mySync*',{},true)
```

#### `options` object properties

The cache instance accepts argument options :

- `new CacheOnRedis(redisOptions[,options])`

| Property     | Default | Description                                                    |
| ------------ | ------- | -------------------------------------------------------------- |
| cache_default| true    | Define if default response will usage cache or not             |
| key_prefix   | cache   | Cache key prefix, every cache storage will contain this prefix |
| expire_time  | 3600    | Cache expiration time in seconds                              |


The cache mathods accepts argument options:
> The same options is valid to async, sync and callback methods

- `cacheEngine.async(myFunction[,options])`

| Property     | Default | Description                                                    |
| ------------ | ------- | -------------------------------------------------------------- |
| key          |         | Define a custom key to use on redis cache key and to invalidate|
| expireAs     | 3600    | Cache expiration time in seconds                               |







