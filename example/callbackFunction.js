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

const myFunction = ({ keya, keyb }, callback = (err, data) => {}) => {
  console.log('My function is called')
  callback(null, keya + '-' + keyb)
}

const myFunctionWithCache = cacheEngine.callback(myFunction)

const main = async () => {
  myFunctionWithCache(
    {
      keya: 'Test a',
      keyb: 'Test b',
    },
    (err, data) => {
      console.log('Fist call on my function returns:', data)
      myFunctionWithCache(
        {
          keya: 'Test a',
          keyb: 'Test b',
        },
        (err, responseSecond) => {
          console.log('Seccond call on my function returns:', responseSecond)

          console.log('Call my function without cache')
          myFunctionWithCache.nocache(
            {
              keya: 'Test a',
              keyb: 'Test b',
            },
            (err, responseNocache) => {
              console.log('Response of call without cache:', responseNocache)
            }
          )
        }
      )
    }
  )
}
main()
