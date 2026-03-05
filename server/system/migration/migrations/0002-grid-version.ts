import { GridVersion } from '~/domain/trading/primitives'
import type { GridConfig } from '~/domain/trading/types'
import { createLogger } from '~/system/logger'
import { MigrationName, MigrationVersion } from '~/system/migration/primitives'
import type { Migration } from '~/system/migration/types'

const log = createLogger('migration:0002')

export const migration0002: Migration = {
  version: MigrationVersion(2),
  name: MigrationName('Add version to grid config'),
  migrate: async (ctx) => {
    const gridStorage = ctx.storage('grid')
    const config = await gridStorage.getItem<GridConfig>('config')
    if (!config) {
      log.info('No grid config found, skipping')
      return { outcome: 'ok', transformed: 0 }
    }

    if (config.version !== undefined) {
      log.info('Grid config already has version, skipping')
      return { outcome: 'ok', transformed: 0 }
    }

    const updated = { ...config, version: GridVersion(1) }
    await gridStorage.setItem('config', updated)
    log.info('Added version: 1 to grid config')
    return { outcome: 'ok', transformed: 1 }
  },
}
