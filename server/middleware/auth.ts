import { config } from '~/system/config/index'

export default defineEventHandler((event) => {
  const { apiToken } = config()
  if (!apiToken) return
  const auth = getHeader(event, 'authorization')
  if (auth !== `Bearer ${apiToken}`)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
})
