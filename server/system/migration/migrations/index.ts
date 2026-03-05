import type { Migration } from '../types'
import { migration0001 } from './0001-init'
import { migration0002 } from './0002-grid-version'

export const migrations: Migration[] = [migration0001, migration0002]
