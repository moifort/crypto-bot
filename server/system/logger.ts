const timestamp = () => new Date().toISOString()

export const log = {
  info: (msg: string, data?: unknown) =>
    data ? console.log(`${timestamp()} ${msg}`, data) : console.log(`${timestamp()} ${msg}`),
  error: (msg: string, data?: unknown) =>
    data ? console.error(`${timestamp()} ${msg}`, data) : console.error(`${timestamp()} ${msg}`),
}
