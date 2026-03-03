import { nowTimestamp } from '~/domain/shared/primitives'
import { log } from '~/system/logger'
import { MigrationVersion } from './primitives'
import type { Migration, MigrationContext, MigrationMeta, MigrationResult } from './types'

const META_KEY = 'meta'

const createContext = (): MigrationContext => ({
  storage: (name: string) => useStorage(name),
})

export const runMigrations = async (migrations: Migration[]): Promise<MigrationResult[]> => {
  const metaStorage = useStorage('migration-meta')
  const meta = await metaStorage.getItem<MigrationMeta>(META_KEY)
  const currentVersion = meta?.currentVersion ?? MigrationVersion(0)

  const pending = migrations
    .toSorted((a, b) => a.version - b.version)
    .filter((m) => m.version > currentVersion)

  if (pending.length === 0) {
    log.info('[migration] No pending migrations')
    return []
  }

  log.info(`[migration] ${pending.length} pending migration(s)`)
  const ctx = createContext()
  const results: MigrationResult[] = []

  for (const migration of pending) {
    log.info(`[migration] Running #${migration.version}: ${migration.name}`)

    let result: MigrationResult
    try {
      result = await migration.migrate(ctx)
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      result = { outcome: 'error', reason }
    }

    results.push(result)

    if (result.outcome === 'error') {
      log.error(`[migration] Failed #${migration.version}: ${result.reason}`)
      break
    }

    await metaStorage.setItem<MigrationMeta>(META_KEY, {
      currentVersion: migration.version,
      appliedAt: nowTimestamp(),
    })
    log.info(`[migration] Completed #${migration.version} (${result.transformed} transformed)`)
  }

  return results
}
