export default defineNitroConfig({
  compatibilityDate: '2026-02-23',
  srcDir: 'server',
  experimental: {
    tasks: true,
  },
  scheduledTasks: {
    '*/30 * * * * *': ['trading:cycle'],
  },
  runtimeConfig: {
    krakenApiKey: '',
    krakenPrivateKey: '',
    apiToken: '',
    gridLowerPrice: '',
    gridUpperPrice: '',
    gridLevels: '',
    orderSizeUsdc: '',
    sandboxMode: '',
    sentryDsn: '',
  },
  storage: {
    grid: { driver: 'fs', base: './.data/db/grid' },
    orders: { driver: 'fs', base: './.data/db/orders' },
    trades: { driver: 'fs', base: './.data/db/trades' },
    snapshots: { driver: 'fs', base: './.data/db/snapshots' },
  },
})
