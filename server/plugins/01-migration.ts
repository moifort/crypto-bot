import { createLogger } from '~/system/logger'
import { migrations } from '~/system/migration/migrations'
import { runMigrations } from '~/system/migration/runner'

const log = createLogger('migration')

export default defineNitroPlugin(async () => {
  const results = await runMigrations(migrations)

  for (const result of results) {
    if (result.outcome === 'error') {
      throw new Error(`[migration] Aborted: ${result.reason}`)
    }
  }

  if (results.length > 0) {
    log.info(`All ${results.length} migration(s) applied successfully`)
  }
})
