import WebSocket from 'ws'
import { createServerHTTP } from './src/http_server'
import { createServerWSS } from './src/ws_server'
import { onProcessClose } from './src/ws_server/helpers/onProcessClose';

onProcessClose(() => {
  createServerWSS().clients.forEach(client => {
    if (client?.readyState === WebSocket.OPEN) {
      client.close()
    }
  })
  createServerWSS().close()
  createServerHTTP().close()
})
