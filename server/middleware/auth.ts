import { config } from '~/system/config/index'

export default defineEventHandler((event) => {
  if (event.path === '/health') return
  const { apiToken } = config()
  if (!apiToken) return
  const auth = getHeader(event, 'authorization')
  if (auth !== `Bearer ${apiToken}`)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
})
