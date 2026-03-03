import { migrations } from '~/system/migration/migrations'
import { runMigrations } from '~/system/migration/runner'
import { log } from '~/system/logger'

export default defineNitroPlugin(async () => {
  const results = await runMigrations(migrations)

  for (const result of results) {
    if (result.outcome === 'error') {
      throw new Error(`[migration] Aborted: ${result.reason}`)
    }
  }

  if (results.length > 0) {
    log.info(`[migration] All ${results.length} migration(s) applied successfully`)
  }
})
