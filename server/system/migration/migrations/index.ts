import type { Migration } from '../types'
import { migration0001 } from './0001-init'

export const migrations: Migration[] = [migration0001]
