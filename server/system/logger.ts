import { consola } from 'consola'

consola.options.formatOptions.date = true

export const createLogger = (tag: string) => consola.withTag(tag)
