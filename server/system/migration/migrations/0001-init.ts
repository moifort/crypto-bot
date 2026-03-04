import { createLogger } from '~/system/logger'
import { MigrationName, MigrationVersion } from '~/system/migration/primitives'
import type { Migration } from '~/system/migration/types'

const log = createLogger('migration:0001')

export const migration0001: Migration = {
  version: MigrationVersion(1),
  name: MigrationName('Initial migration'),
  migrate: async (_ctx) => {
    log.info('No transformation needed for init')
    return { outcome: 'ok', transformed: 0 }
  },
}
