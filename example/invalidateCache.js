const { CacheOnFunction } = require('../dist/index')

const cacheEngine = new CacheOnFunction(
  {
    host: 'localhost',
    port: 6379,
    connect_timeout: 3600000,
    retry_strategy: (options) => {
      return 2000
    },
  },
  {
    cache_default: true,
    expire_time: 6000,
    key_prefix: 'cache-on-function',
  }
)

const myFunction = ({ keya, keyb }) => {
  return new Promise((resolve, reject) => {
    console.log('My function is called')
    resolve(keya + '-' + keyb)
  })
}

const myFunctionWithCache = cacheEngine.async(myFunction)

const main = async () => {
  const result = await myFunctionWithCache({
    keya: 'a',
    keyb: 'b',
  })
  console.log('Call function returns: ', result)

  await cacheEngine.invalidateCache('myFunction*', {}, true)

  const resultInvalidate = await myFunctionWithCache({
    keya: 'a',
    keyb: 'b',
  })
  console.log('Call function after invalidate returns: ', resultInvalidate)
}
main()
