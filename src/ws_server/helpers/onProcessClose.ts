const terminateHandler = (signal: string | null, code: number | null, cb: () => void) => {
  cb()
  const reason = signal || code ? `${signal}-${code}` : `${'ERROR'}`
  console.log(`${reason} Close HttpServer, WebSocket Server and socket connections.`)
  process.exit()
}

export const onProcessClose = (cb: () => void) => {
  process.on('SIGQUIT', (signal: string, code: number) => { terminateHandler(signal, code, cb) });
  process.on('SIGTERM', (signal: string, code: number) => { terminateHandler(signal, code, cb) });
  process.on('SIGKILL', (signal: string, code: number) => { terminateHandler(signal, code, cb) });
  process.on('SIGINT', (signal: string, code: number) => { terminateHandler(signal, code, cb) });
  process.on('SIGHUP', (signal: string, code: number) => { terminateHandler(signal, code, cb) });
  process.on('uncaughtException', () => { terminateHandler(null, null, cb) });
  process.on('unhandledRejection', () => { terminateHandler(null, null, cb) });
}
