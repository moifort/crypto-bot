import { consola } from 'consola'

consola.options.formatOptions.date = true
consola.options.formatOptions.colors = true
consola.options.reporters
  .filter((reporter) => 'formatDate' in reporter)
  .forEach((reporter) => {
    reporter.formatDate = (date: Date, opts: { date?: boolean }) =>
      opts.date ? date.toLocaleTimeString('en-GB') : ''
  })

export const createLogger = (tag: string) => consola.withTag(tag)
