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
    cache_default: false,
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
  const responseFirst = await myFunctionWithCache({
    keya: 'Test a',
    keyb: 'Test b',
  })
  console.log('Fist call on my function returns:', responseFirst)

  const responseSecond = await myFunctionWithCache({
    keya: 'Test a',
    keyb: 'Test b',
  })

  console.log('Seccond call on my function returns:', responseSecond)

  console.log('Call my function with cache')

  const responseNocache = await myFunctionWithCache.withcache({
    keya: 'Test a',
    keyb: 'Test b',
  })

  console.log('Response of call with cache:', responseNocache)
}
main()
