import { createLogger } from '~/system/logger'

const log = createLogger('http')

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    if (event.path === '/health') return
    log.info('on request', event.path)
  })
  nitroApp.hooks.hook('beforeResponse', (event, { body }) => {
    if (event.path === '/health') return
    log.info('on response', event.path, { body })
  })
  nitroApp.hooks.hook('error', (error) => {
    log.error('on error', error)
  })
})
